import { __decorate, __param } from 'tslib';
import { Inject, PLATFORM_ID, InjectionToken, NgModule } from '@angular/core';
import { defineDriver, createInstance, LOCALSTORAGE, WEBSQL, INDEXEDDB } from 'localforage';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { _driver } from 'localforage-cordovasqlitedriver';

/**
 * Storage is an easy way to store key/value pairs and JSON objects.
 * Storage uses a variety of storage engines underneath, picking the best one available
 * depending on the platform.
 *
 * When running in a native app context, Storage will prioritize using SQLite, as it's one of
 * the most stable and widely used file-based databases, and avoids some of the
 * pitfalls of things like localstorage and IndexedDB, such as the OS deciding to clear out such
 * data in low disk-space situations.
 *
 * When running in the web or as a Progressive Web App, Storage will attempt to use
 * IndexedDB, WebSQL, and localstorage, in that order.
 *
 * @usage
 * First, if you'd like to use SQLite, install the cordova-sqlite-storage plugin:
 * ```bash
 * ionic cordova plugin add cordova-sqlite-storage
 * ```
 *
 * Next, install the package (comes by default for Ionic apps > Ionic V1):
 * ```bash
 * npm install --save @ionic/storage
 * ```
 *
 * Next, add it to the imports list in your `NgModule` declaration (for example, in `src/app/app.module.ts`):
 *
 * ```typescript
 * import { IonicStorageModule } from '@ionic/storage';
 *
 * @NgModule({
 *   declarations: [
 *     // ...
 *   ],
 *   imports: [
 *     BrowserModule,
 *     IonicModule.forRoot(MyApp),
 *     IonicStorageModule.forRoot()
 *   ],
 *   bootstrap: [IonicApp],
 *   entryComponents: [
 *     // ...
 *   ],
 *   providers: [
 *     // ...
 *   ]
 * })
 * export class AppModule {}
 *```
 *
 * Finally, inject it into any of your components or pages:
 * ```typescript
 * import { Storage } from '@ionic/storage';

 * export class MyApp {
 *   constructor(private storage: Storage) { }
 *
 *   ...
 *
 *   // set a key/value
 *   storage.set('name', 'Max');
 *
 *   // Or to get a key/value pair
 *   storage.get('age').then((val) => {
 *     console.log('Your age is', val);
 *   });
 * }
 * ```
 *
 *
 * ### Configuring Storage
 *
 * The Storage engine can be configured both with specific storage engine priorities, or custom configuration
 * options to pass to localForage. See the localForage config docs for possible options: https://github.com/localForage/localForage#configuration
 *
 * Note: Any custom configurations will be merged with the default configuration
 *
 * ```typescript
 * import { IonicStorageModule } from '@ionic/storage';
 *
 * @NgModule({
 *   declarations: [...],
 *   imports: [
 *     IonicStorageModule.forRoot({
 *       name: '__mydb',
         driverOrder: ['indexeddb', 'sqlite', 'websql']
 *     })
 *   ],
 *   bootstrap: [...],
 *   entryComponents: [...],
 *    providers: [...]
 * })
 * export class AppModule { }
 * ```
 */
let Storage = class Storage {
    /**
     * Create a new Storage instance using the order of drivers and any additional config
     * options to pass to LocalForage.
     *
     * Possible driver options are: ['sqlite', 'indexeddb', 'websql', 'localstorage'] and the
     * default is that exact ordering.
     */
    constructor(config, platformId) {
        this.platformId = platformId;
        this._driver = null;
        this._dbPromise = new Promise((resolve, reject) => {
            // if (isPlatformServer(this.platformId)) {
            //   const noopDriver = getNoopDriver();
            //   resolve(noopDriver);
            //   return;
            // }
            let db;
            const defaultConfig = getDefaultConfig();
            const actualConfig = Object.assign(defaultConfig, config || {});
            defineDriver(CordovaSQLiteDriver)
                .then(() => {
                db = createInstance(actualConfig);
            })
                .then(() => db.setDriver(this._getDriverOrder(actualConfig.driverOrder)))
                .then(() => {
                this._driver = db.driver();
                resolve(db);
            })
                .catch((reason) => reject(reason));
        });
    }
    /**
     * Get the name of the driver being used.
     * @returns Name of the driver
     */
    get driver() {
        return this._driver;
    }
    /**
     * Reflect the readiness of the store.
     * @returns Returns a promise that resolves when the store is ready
     */
    ready() {
        return this._dbPromise;
    }
    /** @hidden */
    _getDriverOrder(driverOrder) {
        return driverOrder.map((driver) => {
            switch (driver) {
                case 'sqlite':
                    return _driver;
                case 'indexeddb':
                    return INDEXEDDB;
                case 'websql':
                    return WEBSQL;
                case 'localstorage':
                    return LOCALSTORAGE;
            }
        });
    }
    /**
     * Get the value associated with the given key.
     * @param key the key to identify this value
     * @returns Returns a promise with the value of the given key
     */
    get(key) {
        return this._dbPromise.then((db) => db.getItem(key));
    }
    /**
     * Set the value for the given key.
     * @param key the key to identify this value
     * @param value the value for this key
     * @returns Returns a promise that resolves when the key and value are set
     */
    set(key, value) {
        return this._dbPromise.then((db) => db.setItem(key, value));
    }
    /**
     * Remove any value associated with this key.
     * @param key the key to identify this value
     * @returns Returns a promise that resolves when the value is removed
     */
    remove(key) {
        return this._dbPromise.then((db) => db.removeItem(key));
    }
    /**
     * Clear the entire key value store. WARNING: HOT!
     * @returns Returns a promise that resolves when the store is cleared
     */
    clear() {
        return this._dbPromise.then((db) => db.clear());
    }
    /**
     * @returns Returns a promise that resolves with the number of keys stored.
     */
    length() {
        return this._dbPromise.then((db) => db.length());
    }
    /**
     * @returns Returns a promise that resolves with the keys in the store.
     */
    keys() {
        return this._dbPromise.then((db) => db.keys());
    }
    /**
     * Iterate through each key,value pair.
     * @param iteratorCallback a callback of the form (value, key, iterationNumber)
     * @returns Returns a promise that resolves when the iteration has finished.
     */
    forEach(iteratorCallback) {
        return this._dbPromise.then((db) => db.iterate(iteratorCallback));
    }
};
Storage = __decorate([
    __param(1, Inject(PLATFORM_ID))
], Storage);
/** @hidden */
function getDefaultConfig() {
    return {
        name: '_ionicstorage',
        storeName: '_ionickv',
        dbKey: '_ionickey',
        driverOrder: ['sqlite', 'indexeddb', 'websql', 'localstorage'],
    };
}
/** @hidden */
const StorageConfigToken = new InjectionToken('STORAGE_CONFIG_TOKEN');
/** @hidden */
function provideStorage(storageConfig, platformID) {
    const config = !!storageConfig ? storageConfig : getDefaultConfig();
    return new Storage(config, platformID);
}
function getNoopDriver() {
    // noop driver for ssr environment
    const noop = () => { };
    const driver = {
        getItem: noop,
        setItem: noop,
        removeItem: noop,
        clear: noop,
        length: () => 0,
        keys: () => [],
        iterate: noop,
    };
    return driver;
}

var IonicStorageModule_1;
let IonicStorageModule = IonicStorageModule_1 = class IonicStorageModule {
    static forRoot(storageConfig = null) {
        return {
            ngModule: IonicStorageModule_1,
            providers: [
                { provide: StorageConfigToken, useValue: storageConfig },
                {
                    provide: Storage,
                    useFactory: provideStorage,
                    deps: [StorageConfigToken, PLATFORM_ID]
                }
            ]
        };
    }
};
IonicStorageModule = IonicStorageModule_1 = __decorate([
    NgModule()
], IonicStorageModule);

/**
 * Generated bundle index. Do not edit.
 */

export { IonicStorageModule, Storage, StorageConfigToken, provideStorage as ??a };
//# sourceMappingURL=ionic-storage.js.map
