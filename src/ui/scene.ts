/**
 * Orbite scene engine - raymarched night scene shared by every Fieldnote page.
 * Ported 1:1 from G-DESIGN/planches/orbite (locked design, 2026-11-18).
 * cfg: { cam:{ro,ta,fov}, dev:[x,y,z], beam:[x,y,z], beamOn:0..1,
 *        stones:[{p,b,r,s,dim}] (s: 0 local, 1 sending, 2 cloud, 3 cloud asleep) }
 */

export type Vec3 = [number, number, number];
export type StoneState = 0 | 1 | 2 | 3;

export interface StoneCfg {
  p: Vec3;
  b: Vec3;
  r: [number, number];
  s: StoneState;
  dim?: boolean;
  /** Label leader offset (screen px), used by the HUD layer. */
  o?: [number, number];
}

export interface SceneCfg {
  cam: { ro: Vec3; ta: Vec3; fov: number };
  dev: Vec3;
  beam: Vec3;
  beamOn: number;
  stones: StoneCfg[];
}

export type Projector = (p: number[]) => [number, number];

const N = 8;
const W = 1440;
const H = 900;

const FRAG_HEAD = `
precision highp float;
uniform vec2 uRes; uniform vec3 uRo, uTa; uniform float uFl;
uniform vec3 uP[${N}]; uniform vec3 uB[${N}]; uniform vec2 uR[${N}]; uniform float uS[${N}]; uniform float uD[${N}];
uniform vec3 uDev, uBeam; uniform float uOn; uniform int uCount;
`;

const FRAG_BODY = `
float hash(vec3 p){ p=fract(p*0.3183099+vec3(.1,.17,.13)); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float noise(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.0-2.0*f);
  return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm2(vec2 p){ float a=.5,s=0.; vec3 q=vec3(p,1.7); for(int i=0;i<5;i++){ s+=a*noise(q); q=q*2.03+vec3(1.3,.7,2.1); a*=.5;} return s; }
float ridged(vec2 p){ float a=.5,s=0.; vec3 q=vec3(p,3.1); for(int i=0;i<5;i++){ float n=1.0-abs(noise(q)*2.0-1.0); s+=a*n*n; q=q*2.1+vec3(.3,1.1,.5); a*=.5;} return s; }
float terrain(vec2 p){
  float r = length(p);
  float h = (fbm2(p*0.28)-0.45)*1.1*smoothstep(1.2,7.0,r);
  h += 0.05*noise(vec3(p*3.0,0.0)) + 0.02*noise(vec3(p*9.0,2.0));
  h += smoothstep(-6.0,-28.0,p.y)*(ridged(p*0.07)*9.0-1.5);
  return h - 0.04;
}
mat3 rot(vec2 a){ float cy=cos(a.x),sy=sin(a.x),cp=cos(a.y),sp=sin(a.y);
  return mat3(cy,0.,-sy, 0.,1.,0., sy,0.,cy) * mat3(1.,0.,0., 0.,cp,sp, 0.,-sp,cp); }
float sdRB(vec3 p, vec3 b, float r){ vec3 q=abs(p)-b+r; return length(max(q,0.0))+min(max(q.x,max(q.y,q.z)),0.0)-r; }
vec2 map(vec3 p){
  vec2 res = vec2((p.y - terrain(p.xz))*0.55, 0.0);
  for(int i=0;i<${N};i++){
    if(i >= uCount) break;
    vec3 q = rot(uR[i])*(p-uP[i]);
    if(length(q)-length(uB[i])-0.1 < res.x){
      float d = sdRB(q, uB[i], min(uB[i].y,uB[i].z)*0.3);
      d += 0.07*(noise(q*3.2)-0.5) + 0.035*(noise(q*7.5+3.0)-0.5) + 0.014*abs(noise(q*19.0+7.0)-0.5);
      if(d*0.8 < res.x) res = vec2(d*0.8, float(i+1));
    }
  }
  vec3 dq = p-uDev-vec3(0.0,0.03,0.0);
  float dev = sdRB(dq, vec3(0.17,0.012,0.12), 0.01);
  vec3 sq = dq-vec3(0.0,0.1,-0.115); sq = vec3(sq.x, sq.y*0.94+sq.z*0.34, -sq.y*0.34+sq.z*0.94);
  dev = min(dev, sdRB(sq, vec3(0.17,0.11,0.006), 0.006));
  if(dev < res.x) res = vec2(dev, 20.0);
  return res;
}
vec3 normal(vec3 p){ vec2 e=vec2(0.0015,0.0);
  return normalize(vec3(map(p+e.xyy).x-map(p-e.xyy).x, map(p+e.yxy).x-map(p-e.yxy).x, map(p+e.yyx).x-map(p-e.yyx).x)); }
float shadow(vec3 ro, vec3 rd, float mt){ float res=1.0, t=0.03; for(int i=0;i<36;i++){ float h=map(ro+rd*t).x; res=min(res, 10.0*h/t); t+=clamp(h,0.02,0.4); if(res<0.002||t>mt) break; } return clamp(res,0.0,1.0); }
float ao(vec3 p, vec3 n){ float o=0.0, s=1.0; for(int i=0;i<5;i++){ float h=0.02+0.09*float(i); o+=(h-map(p+n*h).x)*s; s*=0.75; } return clamp(1.0-2.2*o,0.0,1.0); }

vec3 MOON = normalize(vec3(0.6,0.35,-0.7));
vec3 sky(vec3 rd){
  float y = max(rd.y,0.0);
  vec3 c = mix(vec3(0.05,0.045,0.055), vec3(0.008,0.01,0.018), smoothstep(0.0,0.35,y));
  vec2 cp = rd.xz/(rd.y+0.12)*1.3;
  float cl = fbm2(cp*1.2+vec2(2.0,5.0));
  float deck = smoothstep(0.38-0.12*(1.0-uOn),0.8,cl)*smoothstep(0.03,0.22,rd.y);
  vec3 cc = vec3(0.035,0.04,0.05);
  float up = exp(-length(cp - vec2(0.0,-0.9))*1.1);
  cc += vec3(0.55,0.75,1.0)*up*0.55*cl*uOn;
  cc += vec3(0.9,0.25,0.18)*0.05*cl;
  c = mix(c, cc, deck);
  vec3 sp = floor(rd*420.0);
  float st = step(0.9975, hash(sp));
  c += vec3(0.8,0.85,1.0)*st*(1.0-deck)*smoothstep(0.05,0.3,y)*0.9;
  return c;
}
float segDist(vec3 ro, vec3 rd, vec3 a, vec3 b, out float tRay, out float hh){
  vec3 ba=b-a, w0=ro-a; float bb=dot(rd,ba), c=dot(ba,ba), d=dot(rd,w0), e=dot(ba,w0);
  float den=max(c-bb*bb,1e-5); float h=clamp((e-bb*d)/den,0.0,1.0); hh=h;
  vec3 pb=a+ba*h; tRay=dot(pb-ro,rd); return length(ro+rd*max(tRay,0.0)-pb);
}
void main(){
  vec2 uv = (2.0*gl_FragCoord.xy-uRes)/uRes.y;
  vec3 ww=normalize(uTa-uRo), uu=normalize(cross(ww,vec3(0,1,0))), vv=cross(uu,ww);
  vec3 rd=normalize(uv.x*uu+uv.y*vv+uFl*ww), ro=uRo;
  float t=0.05; vec2 h=vec2(0.0); bool hit=false;
  for(int i=0;i<220;i++){ h=map(ro+rd*t); if(h.x<0.0006*t){hit=true;break;} t+=h.x; if(t>70.0) break; }
  vec3 col = sky(rd);
  vec3 bA = uBeam, bB = uBeam+vec3(0.0,14.0,0.0);
  vec3 ice = vec3(0.62,0.82,1.0), red = vec3(1.0,0.22,0.12);
  if(hit){
    vec3 p=ro+rd*t, n=normal(p); float id=h.y;
    vec3 alb; float spec=0.04;
    if(id<0.5){ alb = vec3(0.06,0.058,0.062)*(0.6+0.8*noise(p*6.0)); }
    else if(id<19.5){ alb = vec3(0.13,0.125,0.13)*(0.55+0.8*noise(p*8.0)); spec=0.08; }
    else { alb = vec3(0.03); spec=0.4; }
    float oc = ao(p,n);
    float dif = max(dot(n,MOON),0.0)*shadow(p+n*0.01,MOON,10.0);
    vec3 lin = vec3(0.32,0.38,0.55)*dif*0.9 + vec3(0.05,0.06,0.09)*(0.5+0.5*n.y)*oc;
    vec3 cb = vec3(bA.x, clamp(p.y,0.0,6.0), bA.z); vec3 L = cb-p; float ld=length(L); L/=ld;
    lin += ice*2.2*uOn*max(dot(n,L),0.0)/(1.0+ld*ld*2.2)*oc;
    vec3 sL = uDev+vec3(0.0,0.14,-0.06)-p; float sd=length(sL); sL/=sd;
    lin += red*(1.6+1.4*(1.0-uOn))*max(dot(n,sL),0.0)/(1.0+sd*sd*9.0);
    col = alb*lin;
    if(id>0.5 && id<19.5){
      int k=int(id)-1; float st=0.0, dm=0.0; vec3 c0=vec3(0.0);
      for(int j=0;j<${N};j++){ if(j==k){ st=uS[j]; dm=uD[j]; c0=uP[j]; } }
      float fr = pow(1.0-max(dot(n,-rd),0.0),2.5);
      if(st<0.5){
        float cr = smoothstep(0.62,0.7,noise((p-c0)*9.0)) * (1.0-smoothstep(0.0,0.5,noise((p-c0)*3.0+5.0)));
        col += red*(cr*2.4 + fr*0.35);
      } else if(st<1.5){
        col += vec3(1.0,0.5,0.4)*fr*0.8;
      } else if(st<2.5){
        col += ice*(fr*1.1+0.04);
        col = mix(col, vec3(0.75,0.85,0.95)*0.5, smoothstep(0.7,0.95,n.y)*0.5);
      } else {
        col += vec3(0.35,0.37,0.4)*fr*0.35;
      }
      col *= mix(1.0, 0.18, dm);
    }
    if(id>19.5){ vec3 dq=p-uDev; if(dq.y>0.06 && dot(n,normalize(vec3(0.0,0.34,0.94)))>0.8) col = red*1.4; }
    col = mix(col, vec3(0.02,0.022,0.03), 1.0-exp(-t*0.03));
    col = mix(col, vec3(0.06,0.06,0.07), exp(-max(p.y,0.0)*3.0)*(1.0-exp(-max(t-4.0,0.0)*0.08))*0.6);
  } else t=70.0;
  float tr, hh; float d = segDist(ro,rd,bA,bB,tr,hh);
  if(tr<t+0.2){ float fade = exp(-hh*1.6); col += uOn*ice*(0.00055/(d*d+0.00004)*fade + 0.35*exp(-d*9.0)*fade + 0.06*exp(-d*1.8)); }
  float tl=dot(bA-ro,rd); if(tl>0.0 && tl<t+0.3){ float dd=length(ro+rd*tl-bA); col += uOn*ice*0.05/(dd*dd+0.02); }
  vec3 sc = uDev+vec3(0.0,0.14,-0.06); float ts=dot(sc-ro,rd);
  if(ts>0.0 && ts<t+0.3){ float dd=length(ro+rd*ts-sc); col += red*(1.0-uOn)*0.012/(dd*dd+0.01); }
  col = (col*(2.51*col+0.03))/(col*(2.43*col+0.59)+0.14);
  col = pow(clamp(col,0.0,1.0),vec3(0.4545));
  vec2 q=gl_FragCoord.xy/uRes; col *= 0.7+0.3*pow(16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y),0.25);
  col += (hash(vec3(gl_FragCoord.xy,3.0))-0.5)*0.02;
  gl_FragColor = vec4(col,1.0);
}
`;

const VERTEX = 'attribute vec2 a; void main(){ gl_Position=vec4(a,0.0,1.0); }';

const pad = (values: number[], size: number): number[] => {
  const out = values.slice();
  while (out.length < N * size) {
    out.push(0);
  }
  return out;
};

const flat = (stones: StoneCfg[], pick: (s: StoneCfg) => number[]): number[] =>
  pad(stones.flatMap(pick), pick({ p: [0, 0, 0], b: [0, 0, 0], r: [0, 0], s: 0 }).length);

const sub = (a: number[], b: number[]): number[] => a.map((v, i) => v - b[i]);
const dotv = (a: number[], b: number[]): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a: number[]): number[] => {
  const l = Math.hypot(a[0], a[1], a[2]);
  return [a[0] / l, a[1] / l, a[2] / l];
};
const cross = (a: number[], b: number[]): number[] => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

/** Draw the scene once and return the HUD projector (3D -> screen px). */
export const renderScene = (canvas: HTMLCanvasElement, cfg: SceneCfg): Projector => {
  const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true, antialias: false });
  if (!gl) {
    return () => [0, 0];
  }
  const compile = (type: number, src: string): WebGLShader => {
    const shader = gl.createShader(type) as WebGLShader;
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
    }
    return shader;
  };
  const program = gl.createProgram() as WebGLProgram;
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG_HEAD + FRAG_BODY));
  gl.linkProgram(program);
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const attr = gl.getAttribLocation(program, 'a');
  gl.enableVertexAttribArray(attr);
  gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 0, 0);
  const u = (name: string) => gl.getUniformLocation(program, name);
  const cam = cfg.cam;
  const fl = 1 / Math.tan((cam.fov * Math.PI) / 360);
  const stones = cfg.stones.slice(0, N);
  gl.uniform2f(u('uRes'), W, H);
  gl.uniform3fv(u('uRo'), cam.ro);
  gl.uniform3fv(u('uTa'), cam.ta);
  gl.uniform1f(u('uFl'), fl);
  gl.uniform3fv(u('uP'), flat(stones, (s) => s.p));
  gl.uniform3fv(u('uB'), flat(stones, (s) => s.b));
  gl.uniform2fv(u('uR'), pad(stones.flatMap((s) => s.r), 2));
  gl.uniform1fv(u('uS'), pad(stones.map((s) => s.s), 1));
  gl.uniform1fv(u('uD'), pad(stones.map((s) => (s.dim ? 1 : 0)), 1));
  gl.uniform1i(u('uCount'), stones.length);
  gl.uniform3fv(u('uDev'), cfg.dev);
  gl.uniform3fv(u('uBeam'), cfg.beam);
  gl.uniform1f(u('uOn'), cfg.beamOn);
  gl.viewport(0, 0, W, H);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  const ww = norm(sub(cam.ta, cam.ro));
  const uu = norm(cross(ww, [0, 1, 0]));
  const vv = cross(uu, ww);
  return (p: number[]): [number, number] => {
    const v = sub(p, cam.ro);
    const z = dotv(v, ww);
    return [(dotv(v, uu) * fl * 450) / z + W / 2, H - ((dotv(v, vv) * fl * 450) / z + H / 2)];
  };
};

export const HUD_RED = '#ff4b3a';
export const HUD_ICE = '#cfe6ff';
export const HUD_GREY = '#8b9099';

export const stateColor = (s: StoneState): string =>
  s === 2 ? HUD_ICE : s === 3 ? HUD_GREY : HUD_RED;
