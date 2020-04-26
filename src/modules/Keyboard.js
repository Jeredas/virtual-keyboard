export default class {
  constructor(keys, view) {
    this.language = this.getLanguage();
    this.keys = keys;
    this.view = view;

    this.capslockPressed = false;

    this.pressed = [];
    this.createKeyboard();
  }

  createKeyboard() {
    let currentRow;
    this.keys.forEach((key) => {
      if (currentRow !== key.row) {
        const row = document.createElement('div');
        row.classList.add('keyboard_row');
        this.view.append(row);
        currentRow = key.row;
      }
      const button = document.createElement('button');
      button.id = key.code;
      if (key.classes) button.classList = key.classes;
      button.innerHTML = key.isSpecial ? key.name : key[this.language];

      this.view.querySelectorAll('.keyboard_row')[currentRow].append(button);
    });
  }

  changeState(code, type) {
    this.press(code, type);
    this.activateKeys();
    this.switchLanguage();
    this.updateKeys();
  }

  isPressed(keyName) {
    return (keyName === 'CapsLock') ? this.capslockPressed : this.pressed.some((key) => key.includes(keyName));
  }

  updateKeys() {
    this.view.querySelectorAll('button')
      .forEach((btn) => {
        const data = this.getButtonInfo(btn);
        if (!data.isSpecial) {
          let updated = data[this.language];

          if (this.isPressed('Shift')
          || (this.isPressed('Shift') && this.isPressed('CapsLock'))) {
            updated = data[`${this.language}Shift`];
          } else if (this.isPressed('CapsLock')) {
            updated = data[this.language].toUpperCase();
          }

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
    if (!localStorage.getItem('language')) {
      this.setLanguage(currentLanguage);
    } else {
      currentLanguage = localStorage.getItem('language');
    }
    return currentLanguage;
  }

  switchLanguage() {
    if (this.isPressed('ShiftLeft') && this.isPressed('ControlLeft')) {
      this.language = (this.language === 'en') ? 'ru' : 'en';
      this.setLanguage(this.language);
    }
  }

  getButtonInfo(button) {
    return this.keys.filter((key) => key.code === button.id)[0];
  }

  press(code, happening) {
    if (code === 'CapsLock') {
      switch (happening) {
        case 'mousedown':
        case 'keydown':
        case 'keyup':
          this.capslockPressed = !this.capslockPressed;
          break;
        default:
      }
    } else if (code !== 'CapsLock') {
      switch (happening) {
        case 'keydown':
        case 'mousedown':
          if (!this.isPressed(code)) this.pressed.push(code); break;
        case 'keyup':
          if (this.isPressed(code)) this.pressed.splice(this.pressed.indexOf(code), 1); break;
        case 'click':
          if (this.isPressed(code)) {
            this.pressed.splice(this.pressed.indexOf(code), 1);
          }
          break;
        default:
      }
    }
  }

  type(button, text) {
    const btn = this.getButtonInfo(button);
    let updated = text;
    if (btn.isSpecial) {
      switch (btn.code) {
        case 'Backspace':
          updated = updated.slice(0, -1); break;
        case 'Tab':
          updated = `${updated}\t`; break;
        case 'Enter':
          updated = `${updated}\n`; break;
        case 'Space':
          updated = `${updated} `; break;
        default:
          updated = text;
      }
    } else if (this.isPressed('Shift')) {
      updated += btn[`${this.language}Shift`];
    } else if (this.isPressed('CapsLock')) {
      updated += btn[this.language].toUpperCase();
    } else {
      updated += btn[this.language];
    }
    return updated;
  }

  activateKeys() {
    this.view.querySelectorAll('button').forEach((btn) => {
      if (!this.isPressed(btn.id)) btn.classList.remove('active');
    });
    this.pressed.forEach((key) => this.view.querySelector(`#${key}`).classList.add('active'));
    if (this.capslockPressed) this.view.querySelector('#CapsLock').classList.add('active');
  }
}
