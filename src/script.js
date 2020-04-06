import KEYS from './keys.js';

window.onload = () => {
  const hint = document.createElement('p');
  hint.innerHTML = '<strong>Сменить раскладку: left Ctrl + left Shift</strong>. Сделано на&nbsp;Mac&nbsp;OS, расположение кнопок может отличаться от&nbsp;компьютера с&nbsp;Windows (например, Cmd заменяет Win, нет клавиши Del). Если на&nbsp;Windows что-то не&nbsp;работает, пожалуйста, напишите мне в&nbsp;телеграм <strong>hallovarvara</strong> или дискорд <strong>Varya Dev. (@hallovarvara)</strong>';

  const textarea = document.createElement('textarea');
  textarea.classList.add('text');

  document.querySelector('body').append(hint, textarea);

  const keyboardView = document.createElement('div');
  keyboardView.classList.add('keyboard');
  document.body.append(keyboardView);

  class Keyboard {
    constructor(keys) {
      this.language = this.getLanguage();
      this.keys = keys;
      this.capslockPressed = false;
      this.shiftPressed = false;
      this.ctrlPressed = false;
      this.createKeyboard();
    }

    createKeyboard() {
      let currentRow;
      this.keys.forEach((key) => {
        if (currentRow !== key.row) {
          const row = document.createElement('div');
          row.classList.add('keyboard__row');
          keyboardView.append(row);
          currentRow = key.row;
        }
        const button = document.createElement('button');
        button.id = key.code;
        button.classList = (key.classes !== undefined) ? key.classes : '';
        button.innerHTML = (key.isSpecial) ? key.name : key[this.language];

        keyboardView.querySelectorAll('.keyboard__row')[currentRow].append(button);
      });
    }

    updateButtons() {
      const buttons = document.querySelectorAll('button');
      buttons.forEach((button) => {
        const data = this.getButtonInfo(button);
        if (!data.isSpecial) {
          let updated = button.innerHTML;

          if (this.shiftPressed) updated = data[`${this.language}Shift`];
          else if (this.capslockPressed) updated = data[this.language].toUpperCase();
          else updated = data[this.language];

          document.querySelector(`#${data.code}`).innerHTML = updated;
        }
      });
    }

    setLanguage(language = this.language) {
      localStorage.setItem('language', language);
      return this;
    }

    getLanguage() {
      let currentLanguage = 'en';
      if (localStorage.getItem('language') === null) {
        this.setLanguage(currentLanguage);
      } else {
        currentLanguage = localStorage.getItem('language');
      }
      return currentLanguage;
    }

    switchLanguage() {
      if (this.shiftPressed && this.ctrlPressed) {
        this.language = (this.language === 'en') ? 'ru' : 'en';
        this.setLanguage(this.language);
      }
    }

    switchShift(shift) {
      if (shift.id === 'ShiftRight' || shift.id === 'ShiftLeft') {
        this.shiftPressed = !this.shiftPressed;
        this.updateButtons();
      }
    }

    switchCapslock(capslock) {
      if (capslock.id === 'CapsLock') {
        this.capslockPressed = !this.capslockPressed;
        this.updateButtons();
      }
    }

    getButtonInfo(button) {
      return this.keys.filter((key) => key.code === button.id)[0];
    }

    updateTextarea(button) {
      const btn = this.getButtonInfo(button);

      let newValue = textarea.value;
      if (btn.isSpecial) {
        newValue = (btn.changeWith !== undefined) ? btn.changeWith(newValue) : newValue;
      } else if (this.shiftPressed) {
        newValue += btn[`${this.language}Shift`];
      } else if (this.capslockPressed) {
        newValue += btn[this.language].toUpperCase();
      } else {
        newValue += btn[this.language];
      }
      textarea.value = newValue;
    }

    activateButton(code) {
      if (keyboardView.querySelector(`#${code}`) !== null) {
        keyboardView.querySelector(`#${code}`).classList.add('active');
      }
      return this;
    }

    deactivateButton(code) {
      if (keyboardView.querySelector(`#${code}`) !== null) {
        setTimeout(() => {
          keyboardView.querySelector(`#${code}`).classList.remove('active');
        }, 100);
      }
      return this;
    }

    deactivateAllButtons() {
      const activated = keyboardView.querySelectorAll('.active');
      activated.forEach((button) => {
        if (button.id !== 'CapsLock' && button.id !== 'ShiftRight' && button.id !== 'ShiftLeft') {
          this.deactivateButton(button.id);
        }
      });
    }
  }

  const keyboard = new Keyboard(KEYS);

  const isButton = (element) => element.tagName === 'BUTTON';

  document.addEventListener('mousedown', (event) => {
    if (isButton(event.target)) {
      if (event.target.id !== 'CapsLock') {
        keyboard.activateButton(event.target.id);
        keyboard.updateTextarea(event.target);
      }
      keyboard.switchShift(event.target);

      if (event.target.id === 'ControlLeft') {
        keyboard.ctrlPressed = true;
      }

      keyboard.switchLanguage();
    }
  });

  document.addEventListener('mouseup', (event) => {
    if (isButton(event.target)) {
      if (event.target.id !== 'CapsLock') {
        keyboard.deactivateButton(event.target.id);
      }
      keyboard.switchShift(event.target);

      if (event.target.id === 'ControlLeft') {
        keyboard.ctrlPressed = false;
      }
    }
  });

  document.addEventListener('click', (event) => {
    keyboard.deactivateAllButtons();
    keyboard.switchCapslock(event.target);

    if (event.target.id === 'CapsLock') {
      if (event.target.classList.contains('active')) {
        keyboard.deactivateButton(event.target.id);
      } else {
        keyboard.activateButton(event.target.id);
      }
    }
  });

  document.addEventListener('keydown', (event) => {
    event.preventDefault();

    const virtualButton = document.querySelector(`#${event.code}`);
    keyboard.updateTextarea(virtualButton);

    keyboard.activateButton(event.code);

    keyboard.switchShift(virtualButton);

    if (event.code === 'CapsLock') {
      keyboard.switchCapslock(virtualButton);
    }

    if (event.code === 'ControlLeft') {
      keyboard.ctrlPressed = true;
    }

    keyboard.switchLanguage();
  });

  document.addEventListener('keyup', (event) => {
    const virtualButton = document.querySelector(`#${event.code}`);

    keyboard.switchShift(virtualButton);

    if (event.code === 'CapsLock') {
      keyboard.switchCapslock(virtualButton);
      keyboard.deactivateButton(event.code);
    } else if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
      keyboard.deactivateAllButtons();
      keyboard.deactivateButton(event.code);
    } else {
      keyboard.deactivateAllButtons();
    }

    if (event.code === 'ControlLeft') {
      keyboard.ctrlPressed = false;
    }
  });

  textarea.focus();
  textarea.addEventListener('blur', () => textarea.focus());
};
