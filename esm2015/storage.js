import { __decorate, __param } from "tslib";
import { InjectionToken, Inject, PLATFORM_ID } from '@angular/core';
import * as LocalForage from 'localforage';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
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
            LocalForage.defineDriver(CordovaSQLiteDriver)
                .then(() => {
                db = LocalForage.createInstance(actualConfig);
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
                    return CordovaSQLiteDriver._driver;
                case 'indexeddb':
                    return LocalForage.INDEXEDDB;
                case 'websql':
                    return LocalForage.WEBSQL;
                case 'localstorage':
                    return LocalForage.LOCALSTORAGE;
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
export { Storage };
/** @hidden */
export function getDefaultConfig() {
    return {
        name: '_ionicstorage',
        storeName: '_ionickv',
        dbKey: '_ionickey',
        driverOrder: ['sqlite', 'indexeddb', 'websql', 'localstorage'],
    };
}
/** @hidden */
export const StorageConfigToken = new InjectionToken('STORAGE_CONFIG_TOKEN');
/** @hidden */
export function provideStorage(storageConfig, platformID) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0Bpb25pYy9zdG9yYWdlLyIsInNvdXJjZXMiOlsic3RvcmFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBR3BFLE9BQU8sS0FBSyxXQUFXLE1BQU0sYUFBYSxDQUFDO0FBRTNDLE9BQU8sS0FBSyxtQkFBbUIsTUFBTSxpQ0FBaUMsQ0FBQztBQUV2RTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBNkZHO0FBQ0gsSUFBYSxPQUFPLEdBQXBCLE1BQWEsT0FBTztJQUlsQjs7Ozs7O09BTUc7SUFDSCxZQUNFLE1BQXFCLEVBQ1EsVUFBa0I7UUFBbEIsZUFBVSxHQUFWLFVBQVUsQ0FBUTtRQVh6QyxZQUFPLEdBQVcsSUFBSSxDQUFDO1FBYTdCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDaEQsMkNBQTJDO1lBQzNDLHdDQUF3QztZQUN4Qyx5QkFBeUI7WUFDekIsWUFBWTtZQUNaLElBQUk7WUFFSixJQUFJLEVBQWUsQ0FBQztZQUVwQixNQUFNLGFBQWEsR0FBRyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3pDLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLE1BQU0sSUFBSSxFQUFFLENBQUMsQ0FBQztZQUVoRSxXQUFXLENBQUMsWUFBWSxDQUFDLG1CQUFtQixDQUFDO2lCQUMxQyxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNULEVBQUUsR0FBRyxXQUFXLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ2hELENBQUMsQ0FBQztpQkFDRCxJQUFJLENBQUMsR0FB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TV9JRCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgaXNQbGF0Zm9ybVNlcnZlciB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5cbmltcG9ydCAqIGFzIExvY2FsRm9yYWdlIGZyb20gJ2xvY2FsZm9yYWdlJztcblxuaW1wb3J0ICogYXMgQ29yZG92YVNRTGl0ZURyaXZlciBmcm9tICdsb2NhbGZvcmFnZS1jb3Jkb3Zhc3FsaXRlZHJpdmVyJztcblxuLyoqXG4gKiBTdG9yYWdlIGlzIGFuIGVhc3kgd2F5IHRvIHN0b3JlIGtleS92YWx1ZSBwYWlycyBhbmQgSlNPTiBvYmplY3RzLlxuICogU3RvcmFnZSB1c2VzIGEgdmFyaWV0eSBvZiBzdG9yYWdlIGVuZ2luZXMgdW5kZXJuZWF0aCwgcGlja2luZyB0aGUgYmVzdCBvbmUgYXZhaWxhYmxlXG4gKiBkZXBlbmRpbmcgb24gdGhlIHBsYXRmb3JtLlxuICpcbiAqIFdoZW4gcnVubmluZyBpbiBhIG5hdGl2ZSBhcHAgY29udGV4dCwgU3RvcmFnZSB3aWxsIHByaW9yaXRpemUgdXNpbmcgU1FMaXRlLCBhcyBpdCdzIG9uZSBvZlxuICogdGhlIG1vc3Qgc3RhYmxlIGFuZCB3aWRlbHkgdXNlZCBmaWxlLWJhc2VkIGRhdGFiYXNlcywgYW5kIGF2b2lkcyBzb21lIG9mIHRoZVxuICogcGl0ZmFsbHMgb2YgdGhpbmdzIGxpa2UgbG9jYWxzdG9yYWdlIGFuZCBJbmRleGVkREIsIHN1Y2ggYXMgdGhlIE9TIGRlY2lkaW5nIHRvIGNsZWFyIG91dCBzdWNoXG4gKiBkYXRhIGluIGxvdyBkaXNrLXNwYWNlIHNpdHVhdGlvbnMuXG4gKlxuICogV2hlbiBydW5uaW5nIGluIHRoZSB3ZWIgb3IgYXMgYSBQcm9ncmVzc2l2ZSBXZWIgQXBwLCBTdG9yYWdlIHdpbGwgYXR0ZW1wdCB0byB1c2VcbiAqIEluZGV4ZWREQiwgV2ViU1FMLCBhbmQgbG9jYWxzdG9yYWdlLCBpbiB0aGF0IG9yZGVyLlxuICpcbiAqIEB1c2FnZVxuICogRmlyc3QsIGlmIHlvdSdkIGxpa2UgdG8gdXNlIFNRTGl0ZSwgaW5zdGFsbCB0aGUgY29yZG92YS1zcWxpdGUtc3RvcmFnZSBwbHVnaW46XG4gKiBgYGBiYXNoXG4gKiBpb25pYyBjb3Jkb3ZhIHBsdWdpbiBhZGQgY29yZG92YS1zcWxpdGUtc3RvcmFnZVxuICogYGBgXG4gKlxuICogTmV4dCwgaW5zdGFsbCB0aGUgcGFja2FnZSAoY29tZXMgYnkgZGVmYXVsdCBmb3IgSW9uaWMgYXBwcyA+IElvbmljIFYxKTpcbiAqIGBgYGJhc2hcbiAqIG5wbSBpbnN0YWxsIC0tc2F2ZSBAaW9uaWMvc3RvcmFnZVxuICogYGBgXG4gKlxuICogTmV4dCwgYWRkIGl0IHRvIHRoZSBpbXBvcnRzIGxpc3QgaW4geW91ciBgTmdNb2R1bGVgIGRlY2xhcmF0aW9uIChmb3IgZXhhbXBsZSwgaW4gYHNyYy9hcHAvYXBwLm1vZHVsZS50c2ApOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7IElvbmljU3RvcmFnZU1vZHVsZSB9IGZyb20gJ0Bpb25pYy9zdG9yYWdlJztcbiAqXG4gKiBATmdNb2R1bGUoe1xuICogICBkZWNsYXJhdGlvbnM6IFtcbiAqICAgICAvLyAuLi5cbiAqICAgXSxcbiAqICAgaW1wb3J0czogW1xuICogICAgIEJyb3dzZXJNb2R1bGUsXG4gKiAgICAgSW9uaWNNb2R1bGUuZm9yUm9vdChNeUFwcCksXG4gKiAgICAgSW9uaWNTdG9yYWdlTW9kdWxlLmZvclJvb3QoKVxuICogICBdLFxuICogICBib290c3RyYXA6IFtJb25pY0FwcF0sXG4gKiAgIGVudHJ5Q29tcG9uZW50czogW1xuICogICAgIC8vIC4uLlxuICogICBdLFxuICogICBwcm92aWRlcnM6IFtcbiAqICAgICAvLyAuLi5cbiAqICAgXVxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBBcHBNb2R1bGUge31cbiAqYGBgXG4gKlxuICogRmluYWxseSwgaW5qZWN0IGl0IGludG8gYW55IG9mIHlvdXIgY29tcG9uZW50cyBvciBwYWdlczpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7IFN0b3JhZ2UgfSBmcm9tICdAaW9uaWMvc3RvcmFnZSc7XG5cbiAqIGV4cG9ydCBjbGFzcyBNeUFwcCB7XG4gKiAgIGNvbnN0cnVjdG9yKHByaXZhdGUgc3RvcmFnZTogU3RvcmFnZSkgeyB9XG4gKlxuICogICAuLi5cbiAqXG4gKiAgIC8vIHNldCBhIGtleS92YWx1ZVxuICogICBzdG9yYWdlLnNldCgnbmFtZScsICdNYXgnKTtcbiAqXG4gKiAgIC8vIE9yIHRvIGdldCBhIGtleS92YWx1ZSBwYWlyXG4gKiAgIHN0b3JhZ2UuZ2V0KCdhZ2UnKS50aGVuKCh2YWwpID0+IHtcbiAqICAgICBjb25zb2xlLmxvZygnWW91ciBhZ2UgaXMnLCB2YWwpO1xuICogICB9KTtcbiAqIH1cbiAqIGBgYFxuICpcbiAqXG4gKiAjIyMgQ29uZmlndXJpbmcgU3RvcmFnZVxuICpcbiAqIFRoZSBTdG9yYWdlIGVuZ2luZSBjYW4gYmUgY29uZmlndXJlZCBib3RoIHdpdGggc3BlY2lmaWMgc3RvcmFnZSBlbmdpbmUgcHJpb3JpdGllcywgb3IgY3VzdG9tIGNvbmZpZ3VyYXRpb25cbiAqIG9wdGlvbnMgdG8gcGFzcyB0byBsb2NhbEZvcmFnZS4gU2VlIHRoZSBsb2NhbEZvcmFnZSBjb25maWcgZG9jcyBmb3IgcG9zc2libGUgb3B0aW9uczogaHR0cHM6Ly9naXRodWIuY29tL2xvY2FsRm9yYWdlL2xvY2FsRm9yYWdlI2NvbmZpZ3VyYXRpb25cbiAqXG4gKiBOb3RlOiBBbnkgY3VzdG9tIGNvbmZpZ3VyYXRpb25zIHdpbGwgYmUgbWVyZ2VkIHdpdGggdGhlIGRlZmF1bHQgY29uZmlndXJhdGlvblxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7IElvbmljU3RvcmFnZU1vZHVsZSB9IGZyb20gJ0Bpb25pYy9zdG9yYWdlJztcbiAqXG4gKiBATmdNb2R1bGUoe1xuICogICBkZWNsYXJhdGlvbnM6IFsuLi5dLFxuICogICBpbXBvcnRzOiBbXG4gKiAgICAgSW9uaWNTdG9yYWdlTW9kdWxlLmZvclJvb3Qoe1xuICogICAgICAgbmFtZTogJ19fbXlkYicsXG4gICAgICAgICBkcml2ZXJPcmRlcjogWydpbmRleGVkZGInLCAnc3FsaXRlJywgJ3dlYnNxbCddXG4gKiAgICAgfSlcbiAqICAgXSxcbiAqICAgYm9vdHN0cmFwOiBbLi4uXSxcbiAqICAgZW50cnlDb21wb25lbnRzOiBbLi4uXSxcbiAqICAgIHByb3ZpZGVyczogWy4uLl1cbiAqIH0pXG4gKiBleHBvcnQgY2xhc3MgQXBwTW9kdWxlIHsgfVxuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBTdG9yYWdlIHtcbiAgcHJpdmF0ZSBfZGJQcm9taXNlOiBQcm9taXNlPExvY2FsRm9yYWdlPjtcbiAgcHJpdmF0ZSBfZHJpdmVyOiBzdHJpbmcgPSBudWxsO1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgU3RvcmFnZSBpbnN0YW5jZSB1c2luZyB0aGUgb3JkZXIgb2YgZHJpdmVycyBhbmQgYW55IGFkZGl0aW9uYWwgY29uZmlnXG4gICAqIG9wdGlvbnMgdG8gcGFzcyB0byBMb2NhbEZvcmFnZS5cbiAgICpcbiAgICogUG9zc2libGUgZHJpdmVyIG9wdGlvbnMgYXJlOiBbJ3NxbGl0ZScsICdpbmRleGVkZGInLCAnd2Vic3FsJywgJ2xvY2Fsc3RvcmFnZSddIGFuZCB0aGVcbiAgICogZGVmYXVsdCBpcyB0aGF0IGV4YWN0IG9yZGVyaW5nLlxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgY29uZmlnOiBTdG9yYWdlQ29uZmlnLFxuICAgIEBJbmplY3QoUExBVEZPUk1fSUQpIHByaXZhdGUgcGxhdGZvcm1JZDogT2JqZWN0XG4gICkge1xuICAgIHRoaXMuX2RiUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIC8vIGlmIChpc1BsYXRmb3JtU2VydmVyKHRoaXMucGxhdGZvcm1JZCkpIHtcbiAgICAgIC8vICAgY29uc3Qgbm9vcERyaXZlciA9IGdldE5vb3BEcml2ZXIoKTtcbiAgICAgIC8vICAgcmVzb2x2ZShub29wRHJpdmVyKTtcbiAgICAgIC8vICAgcmV0dXJuO1xuICAgICAgLy8gfVxuXG4gICAgICBsZXQgZGI6IExvY2FsRm9yYWdlO1xuXG4gICAgICBjb25zdCBkZWZhdWx0Q29uZmlnID0gZ2V0RGVmYXVsdENvbmZpZygpO1xuICAgICAgY29uc3QgYWN0dWFsQ29uZmlnID0gT2JqZWN0LmFzc2lnbihkZWZhdWx0Q29uZmlnLCBjb25maWcgfHwge30pO1xuXG4gICAgICBMb2NhbEZvcmFnZS5kZWZpbmVEcml2ZXIoQ29yZG92YVNRTGl0ZURyaXZlcilcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGRiID0gTG9jYWxGb3JhZ2UuY3JlYXRlSW5zdGFuY2UoYWN0dWFsQ29uZmlnKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT5cbiAgICAgICAgICBkYi5zZXREcml2ZXIodGhpcy5fZ2V0RHJpdmVyT3JkZXIoYWN0dWFsQ29uZmlnLmRyaXZlck9yZGVyKSlcbiAgICAgICAgKVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5fZHJpdmVyID0gZGIuZHJpdmVyKCk7XG4gICAgICAgICAgcmVzb2x2ZShkYik7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgocmVhc29uKSA9PiByZWplY3QocmVhc29uKSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBuYW1lIG9mIHRoZSBkcml2ZXIgYmVpbmcgdXNlZC5cbiAgICogQHJldHVybnMgTmFtZSBvZiB0aGUgZHJpdmVyXG4gICAqL1xuICBnZXQgZHJpdmVyKCk6IHN0cmluZyB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9kcml2ZXI7XG4gIH1cblxuICAvKipcbiAgICogUmVmbGVjdCB0aGUgcmVhZGluZXNzIG9mIHRoZSBzdG9yZS5cbiAgICogQHJldHVybnMgUmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSBzdG9yZSBpcyByZWFkeVxuICAgKi9cbiAgcmVhZHkoKTogUHJvbWlzZTxMb2NhbEZvcmFnZT4ge1xuICAgIHJldHVybiB0aGlzLl9kYlByb21pc2U7XG4gIH1cblxuICAvKiogQGhpZGRlbiAqL1xuICBwcml2YXRlIF9nZXREcml2ZXJPcmRlcihkcml2ZXJPcmRlcjogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gZHJpdmVyT3JkZXIubWFwKChkcml2ZXI6IHN0cmluZykgPT4ge1xuICAgICAgc3dpdGNoIChkcml2ZXIpIHtcbiAgICAgICAgY2FzZSAnc3FsaXRlJzpcbiAgICAgICAgICByZXR1cm4gQ29yZG92YVNRTGl0ZURyaXZlci5fZHJpdmVyO1xuICAgICAgICBjYXNlICdpbmRleGVkZGInOlxuICAgICAgICAgIHJldHVybiBMb2NhbEZvcmFnZS5JTkRFWEVEREI7XG4gICAgICAgIGNhc2UgJ3dlYnNxbCc6XG4gICAgICAgICAgcmV0dXJuIExvY2FsRm9yYWdlLldFQlNRTDtcbiAgICAgICAgY2FzZSAnbG9jYWxzdG9yYWdlJzpcbiAgICAgICAgICByZXR1cm4gTG9jYWxGb3JhZ2UuTE9DQUxTVE9SQUdFO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIHRoZSBnaXZlbiBrZXkuXG4gICAqIEBwYXJhbSBrZXkgdGhlIGtleSB0byBpZGVudGlmeSB0aGlzIHZhbHVlXG4gICAqIEByZXR1cm5zIFJldHVybnMgYSBwcm9taXNlIHdpdGggdGhlIHZhbHVlIG9mIHRoZSBnaXZlbiBrZXlcbiAgICovXG4gIGdldChrZXk6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMuX2RiUHJvbWlzZS50aGVuKChkYikgPT4gZGIuZ2V0SXRlbShrZXkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHZhbHVlIGZvciB0aGUgZ2l2ZW4ga2V5LlxuICAgKiBAcGFyYW0ga2V5IHRoZSBrZXkgdG8gaWRlbnRpZnkgdGhpcyB2YWx1ZVxuICAgKiBAcGFyYW0gdmFsdWUgdGhlIHZhbHVlIGZvciB0aGlzIGtleVxuICAgKiBAcmV0dXJucyBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIGtleSBhbmQgdmFsdWUgYXJlIHNldFxuICAgKi9cbiAgc2V0KGtleTogc3RyaW5nLCB2YWx1ZTogYW55KTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gdGhpcy5fZGJQcm9taXNlLnRoZW4oKGRiKSA9PiBkYi5zZXRJdGVtKGtleSwgdmFsdWUpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYW55IHZhbHVlIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGtleS5cbiAgICogQHBhcmFtIGtleSB0aGUga2V5IHRvIGlkZW50aWZ5IHRoaXMgdmFsdWVcbiAgICogQHJldHVybnMgUmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSB2YWx1ZSBpcyByZW1vdmVkXG4gICAqL1xuICByZW1vdmUoa2V5OiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiB0aGlzLl9kYlByb21pc2UudGhlbigoZGIpID0+IGRiLnJlbW92ZUl0ZW0oa2V5KSk7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXIgdGhlIGVudGlyZSBrZXkgdmFsdWUgc3RvcmUuIFdBUk5JTkc6IEhPVCFcbiAgICogQHJldHVybnMgUmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSBzdG9yZSBpcyBjbGVhcmVkXG4gICAqL1xuICBjbGVhcigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fZGJQcm9taXNlLnRoZW4oKGRiKSA9PiBkYi5jbGVhcigpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlIG51bWJlciBvZiBrZXlzIHN0b3JlZC5cbiAgICovXG4gIGxlbmd0aCgpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIHJldHVybiB0aGlzLl9kYlByb21pc2UudGhlbigoZGIpID0+IGRiLmxlbmd0aCgpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlIGtleXMgaW4gdGhlIHN0b3JlLlxuICAgKi9cbiAga2V5cygpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgcmV0dXJuIHRoaXMuX2RiUHJvbWlzZS50aGVuKChkYikgPT4gZGIua2V5cygpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdGVyYXRlIHRocm91Z2ggZWFjaCBrZXksdmFsdWUgcGFpci5cbiAgICogQHBhcmFtIGl0ZXJhdG9yQ2FsbGJhY2sgYSBjYWxsYmFjayBvZiB0aGUgZm9ybSAodmFsdWUsIGtleSwgaXRlcmF0aW9uTnVtYmVyKVxuICAgKiBAcmV0dXJucyBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIGl0ZXJhdGlvbiBoYXMgZmluaXNoZWQuXG4gICAqL1xuICBmb3JFYWNoKFxuICAgIGl0ZXJhdG9yQ2FsbGJhY2s6ICh2YWx1ZTogYW55LCBrZXk6IHN0cmluZywgaXRlcmF0aW9uTnVtYmVyOiBOdW1iZXIpID0+IGFueVxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fZGJQcm9taXNlLnRoZW4oKGRiKSA9PiBkYi5pdGVyYXRlKGl0ZXJhdG9yQ2FsbGJhY2spKTtcbiAgfVxufVxuXG4vKiogQGhpZGRlbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldERlZmF1bHRDb25maWcoKSB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ19pb25pY3N0b3JhZ2UnLFxuICAgIHN0b3JlTmFtZTogJ19pb25pY2t2JyxcbiAgICBkYktleTogJ19pb25pY2tleScsXG4gICAgZHJpdmVyT3JkZXI6IFsnc3FsaXRlJywgJ2luZGV4ZWRkYicsICd3ZWJzcWwnLCAnbG9jYWxzdG9yYWdlJ10sXG4gIH07XG59XG5cbi8qKiBAaGlkZGVuICovXG5leHBvcnQgaW50ZXJmYWNlIFN0b3JhZ2VDb25maWcge1xuICBuYW1lPzogc3RyaW5nO1xuICB2ZXJzaW9uPzogbnVtYmVyO1xuICBzaXplPzogbnVtYmVyO1xuICBzdG9yZU5hbWU/OiBzdHJpbmc7XG4gIGRlc2NyaXB0aW9uPzogc3RyaW5nO1xuICBkcml2ZXJPcmRlcj86IHN0cmluZ1tdO1xuICBkYktleT86IHN0cmluZztcbn1cblxuLyoqIEBoaWRkZW4gKi9cbmV4cG9ydCBjb25zdCBTdG9yYWdlQ29uZmlnVG9rZW4gPSBuZXcgSW5qZWN0aW9uVG9rZW48YW55PihcbiAgJ1NUT1JBR0VfQ09ORklHX1RPS0VOJ1xuKTtcblxuLyoqIEBoaWRkZW4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlU3RvcmFnZShcbiAgc3RvcmFnZUNvbmZpZzogU3RvcmFnZUNvbmZpZyxcbiAgcGxhdGZvcm1JRDogT2JqZWN0XG4pOiBTdG9yYWdlIHtcbiAgY29uc3QgY29uZmlnID0gISFzdG9yYWdlQ29uZmlnID8gc3RvcmFnZUNvbmZpZyA6IGdldERlZmF1bHRDb25maWcoKTtcbiAgcmV0dXJuIG5ldyBTdG9yYWdlKGNvbmZpZywgcGxhdGZvcm1JRCk7XG59XG5cbmZ1bmN0aW9uIGdldE5vb3BEcml2ZXIoKSB7XG4gIC8vIG5vb3AgZHJpdmVyIGZvciBzc3IgZW52aXJvbm1lbnRcbiAgY29uc3Qgbm9vcCA9ICgpID0+IHt9O1xuICBjb25zdCBkcml2ZXI6IGFueSA9IHtcbiAgICBnZXRJdGVtOiBub29wLFxuICAgIHNldEl0ZW06IG5vb3AsXG4gICAgcmVtb3ZlSXRlbTogbm9vcCxcbiAgICBjbGVhcjogbm9vcCxcbiAgICBsZW5ndGg6ICgpID0+IDAsXG4gICAga2V5czogKCkgPT4gW10sXG4gICAgaXRlcmF0ZTogbm9vcCxcbiAgfTtcbiAgcmV0dXJuIGRyaXZlcjtcbn1cbiJdfQ==