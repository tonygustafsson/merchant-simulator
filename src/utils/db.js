import localforage from 'localforage';
import cloneDeep from 'lodash-es/cloneDeep';

localforage.config({
    name: `Merchant's Endeavor`,
    storeName: 'game'
});

export const saveStateToDb = (table, state) => {
    localforage.setItem(table, state);
};

export const getStateFromDb = table => {
    return new Promise((resolve, reject) => {
        localforage
            .getItem(table)
            .then(value => {
                if (value) {
                    resolve(value);
                }

                reject('Not stored');
            })
            .catch(err => {
                reject(err);
            });
    });
};

export const syncState = (tableName, store, initValue, calcInitValue) => {
    getStateFromDb(tableName)
        .then(value => {
            const newValue = cloneDeep(Object.assign(initValue, value));
            store.updateAll(newValue);
        })
        .catch(err => {
            const newInitValue = calcInitValue ? Object.assign(initValue, calcInitValue()) : initValue;
            store.updateAll(newInitValue);
        })
        .finally(() => {
            store.subscribe(value => {
                saveStateToDb(tableName, value);
            });
        });
};

export const clearDatabase = () => {
    localforage
        .clear()
        .then(() => {
            console.log('Cleared database');
        })
        .catch(err => {
            console.error(err);
        });
};
