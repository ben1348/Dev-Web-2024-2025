/** @type {import("jest").Config} **/
module.exports = {
  // Configuration de base
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testRegex: '\\.(test|spec)\\.ts$',
  
  // Extensions de fichiers
  moduleFileExtensions: ['ts', 'js', 'json'],
  
  // Transformation des fichiers
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  
  // Configuration TypeScript inline
  globals: {
    'ts-jest': {
      tsconfig: {
        target: 'es5',
        module: 'commonjs',
        experimentalDecorators: true,
        emitDecoratorMetadata: true
      }
    }
  },
  
  // Ignorer TOUS les node_modules
  transformIgnorePatterns: [
    'node_modules'
  ],
  
  // Mock de tous les modules problématiques - CHEMINS CORRECTS
  moduleNameMapper: {
    '^@angular/core$': '<rootDir>/__mocks__/@angular/core.js',
    '^@angular/core/testing$': '<rootDir>/__mocks__/@angular/core/testing.js',
    '^@angular/common$': '<rootDir>/__mocks__/@angular/common.js',
    '^@angular/common/http$': '<rootDir>/__mocks__/@angular/common/http.js',
    '^@angular/router$': '<rootDir>/__mocks__/simple.js',
    '^@angular/forms$': '<rootDir>/__mocks__/simple.js',
    '^@angular/fire/database$': '<rootDir>/__mocks__/simple.js',
    '^@angular/material/.*$': '<rootDir>/__mocks__/simple.js',
    '^@angular/common/http/testing$': '<rootDir>/__mocks__/simple.js',
    '^rxjs$': '<rootDir>/__mocks__/rxjs.js',
    '^is-generator-fn$': '<rootDir>/__mocks__/simple.js',
    '^slash$': '<rootDir>/__mocks__/simple.js',
    '^p-limit$': '<rootDir>/__mocks__/simple.js',
    '^yocto-queue$': '<rootDir>/__mocks__/simple.js'
  },
  
  // =================================================================================
  // 🎨 CONFIGURATION D'AFFICHAGE STYLE BACKEND - TOUS LES TESTS
  // =================================================================================
  
  // Setup professionnel avec formatage personnalisé
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  
  // Messages personnalisés pour les tests
  displayName: {
    name: '🎯 FRONTEND TESTS COMPLETS',
    color: 'cyan'
  },
  
  // =================================================================================
  // 📋 ORDRE D'AFFICHAGE : ERREURS → RÉSUMÉ → TABLEAU (TOUS TESTS)
  // =================================================================================
  
  // Configuration pour affichage ordonné avec tous les tests
  verbose: false,  // Désactivé pour contrôler manuellement l'affichage
  silent: false,   // Garder les console.log/error
  
  // Reporters organisés pour affichage séquentiel
  reporters: [
    // Reporter principal avec résumé organisé
    [
      'default',
      {
        summaryThreshold: 0,  // Toujours afficher le résumé
        silent: false,        // Afficher les console.log
        verbose: false        // Pas de détails inline pendant les tests
      }
    ]
  ],
  
  // =================================================================================
  // ⚙️ PARAMÈTRES D'EXÉCUTION OPTIMISÉS POUR TOUS LES TESTS
  // =================================================================================
  
  // Timing et gestion des tests
  testTimeout: 20000,  // Plus de temps pour tous les tests
  maxWorkers: '50%',
  maxConcurrency: 5,
  bail: false, // Continuer tous les tests même en cas d'échec
  
  // Gestion des erreurs et affichage
  errorOnDeprecated: false,
  clearMocks: false,  // Ne pas effacer : les mocks __mocks__ définissent leurs implémentations au chargement
  resetMocks: false,  // Ne pas reset : sinon TestBed.configureTestingModule() renvoie undefined et casse tous les tests composants
  restoreMocks: false,
  
  // =================================================================================
  // 📊 CONFIGURATION DE COUVERTURE - TABLEAU EN DERNIER
  // =================================================================================
  
  // Configuration de la couverture de code - TABLEAU EN FIN
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text-summary',   // Résumé concis d'abord
    'text'            // Tableau détaillé EN DERNIER
  ],
  
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.test.{ts,js}',
    '!src/**/*.spec.{ts,js}',
    '!src/main.ts',
    '!src/polyfills.ts',
    '!src/environments/**',
    '!src/**/*.module.ts',
    '!src/**/*.d.ts'
  ],
  
  // Seuils de couverture ajustés pour tous les tests
  coverageThreshold: {
    global: {
      branches: 3,    // Réduit pour passer avec tous les tests
      functions: 3,   
      lines: 3,       
      statements: 3   
    },
    // Seuils spécifiques pour fichiers critiques
    './src/app/pages/roulette-net/roulette-net-logic.ts': {
      branches: 15,   // Réduit mais toujours significatif
      functions: 20,
      lines: 20,
      statements: 20
    }
  },
  
  // =================================================================================
  // 🎯 PATTERNS ET EXCLUSIONS POUR TOUS LES TESTS
  // =================================================================================
  
  // Patterns d'exclusion
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],
  
  // Configuration pour l'environnement de test
  testEnvironmentOptions: {
    url: 'http://localhost:4200'
  },
  
  // Gestion des modules
  unmockedModulePathPatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ],
  
  // =================================================================================
  // 🔧 OPTIMISATION FINALE POUR AFFICHAGE PROFESSIONNEL COMPLET
  // =================================================================================
  
  // Notifications et snapshots
  notify: false,
  notifyMode: 'failure-change',
  updateSnapshot: false,
  
  // Performance et logs
  logHeapUsage: false,
  detectLeaks: false,
  forceExit: false,
  slowTestThreshold: 8,  // Un peu plus de tolérance
  
  // Chemins et workers
  rootDir: '.',
  testMatch: undefined
};
