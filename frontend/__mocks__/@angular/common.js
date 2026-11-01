// Mock pour @angular/common
module.exports = {
  CommonModule: class {
    static forRoot() {
      return {
        ngModule: this,
        providers: []
      };
    }
  },
  
  NgIf: class {},
  NgFor: class {},
  NgSwitch: class {},
  NgSwitchCase: class {},
  NgSwitchDefault: class {},
  NgClass: class {},
  NgStyle: class {},

  isPlatformBrowser: (platformId) => platformId === 'browser' || platformId === undefined,
  isPlatformServer: (platformId) => platformId === 'server',
  
  DatePipe: class {
    transform(value, format) {
      return value ? value.toString() : '';
    }
  },
  
  CurrencyPipe: class {
    transform(value, currency) {
      return value ? `${currency || '$'}${value}` : '';
    }
  },
  
  DecimalPipe: class {
    transform(value, format) {
      return value ? value.toString() : '';
    }
  },
  
  PercentPipe: class {
    transform(value) {
      return value ? `${value}%` : '';
    }
  }
}; 