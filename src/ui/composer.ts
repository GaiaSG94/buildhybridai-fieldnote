export interface ComposerHandles {
  root: HTMLElement;
  textarea: HTMLTextAreaElement;
  language: HTMLSelectElement;
  cloudOn: boolean;
  setCloud: (on: boolean) => void;
  setNumber: (label: string) => void;
  setCloudLabel: (label: string) => void;
  clear: () => void;
}

const LANGUAGES: [string, string][] = [
  ['English', 'EN'],
  ['French', 'FR'],
  ['Portuguese', 'PT'],
  ['Spanish', 'ES'],
  ['Arabic', 'AR'],
];

/** EN code for a language name (label shown on the readout sections). */
export const languageCode = (name: string): string =>
  LANGUAGES.find(([label]) => label === name)?.[1] ?? name.slice(0, 2).toUpperCase();

const el = (tag: string, className?: string): HTMLElement => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
};

/**
 * The composer band, drawn as the planche and wired to the real form:
 * a note body, a translation language and the cloud opt-in.
 */
export const buildComposer = (
  root: HTMLElement,
  onSubmit: (body: string, language: string, cloudOn: boolean) => void,
  options: { cloudLabel?: string; disabled?: boolean } = {},
): ComposerHandles => {
  let cloudOn = true;
  const band = el('section', 'composer');
  const lab = el('div', 'lab');
  const numberLabel = el('b');
  numberLabel.textContent = 'N°—';
  lab.append(numberLabel, document.createTextNode('NEW NOTE'));
  const textarea = document.createElement('textarea');
  textarea.rows = 2;
  textarea.placeholder = 'Write a field note — it is summarized and translated on this device';
  textarea.setAttribute('aria-label', 'New field note');
  const act = el('div', 'act');
  const translateLabel = el('span');
  translateLabel.textContent = 'TRANSLATE';
  const select = document.createElement('select');
  select.setAttribute('aria-label', 'Translation language');
  for (const [name, code] of LANGUAGES) {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = code;
    select.appendChild(option);
  }
  const cloudToggle = el('u');
  const cloud = el('span');
  cloud.append(document.createTextNode('CLOUD '), cloudToggle);
  const button = document.createElement('button');
  button.className = 'btn';
  button.type = 'button';
  button.textContent = 'SAVE NOTE';
  if (options.disabled) button.disabled = true;
  act.append(translateLabel, select, cloud, button);
  band.append(lab, textarea, act);
  root.appendChild(band);

  const setCloud = (on: boolean): void => {
    cloudOn = on;
    cloudToggle.textContent = on ? (options.cloudLabel ?? 'ON') : 'OFF';
  };
  const setCloudLabel = (label: string): void => {
    cloudToggle.textContent = label;
  };
  cloud.addEventListener('click', () => setCloud(!cloudOn));
  const submit = (): void => {
    const body = textarea.value;
    if (!body.trim() || button.disabled) return;
    onSubmit(body, select.value, cloudOn);
  };
  button.addEventListener('click', submit);
  textarea.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  });
  return {
    root: band,
    textarea,
    language: select,
    cloudOn,
    setCloud,
    setCloudLabel,
    setNumber: (label) => {
      numberLabel.textContent = label;
    },
    clear: () => {
      textarea.value = '';
    },
  };
};
