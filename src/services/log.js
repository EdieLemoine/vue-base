export default {

  success: (msg) => this.log(msg, 'success', 'color: white; background-color: #0f0'),
  error: (msg) => this.log(msg, 'error', 'color: white; background-color: #f00'),
  warning: (msg) => this.log(msg, 'warning', 'color: white; background-color: #ff0'),
  info: (msg) => this.log(msg, 'info', 'color: white; background-color: #00ffff;'),
  note: (msg) => this.log(msg, 'note', 'color: white; background-color: #00ffff;'),

  log: (msg, name, style) => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(`%c ${name} %c ${msg}`, `border-radius: 2px; ${style}`);
    }
  },
};
