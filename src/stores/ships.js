import { writable } from 'svelte/store';
import { ticker } from './ticker';
import { goods } from './goods';
import { getRandomShip } from '../utils/ship';
import { getStateFromDb, saveStateToDb } from '../utils/db';

let currentTick = 0;
const missionLength = 10;

const tableName = 'ships';
const minValue = 0;
const maxValue = 10;

function shipsStore() {
    const { subscribe, set, update } = writable([]);

    return {
        subscribe,
        updateAll: data => {
            update(ships => ships.concat(data));
        },
        addShip: () => {
            update(ships => {
                if (ships.length + 1 > maxValue) return ships;

                const newShip = getRandomShip();
                ships.push(newShip);

                return ships;
            });
        },
        removeShip: id => {
            update(ships => {
                if (ships.length - 1 < minValue) return ships;
                ships = ships.filter(ship => ship.id !== id);

                return ships;
            });
        },
        sendOnMission: id => {
            update(ships => {
                let ship = ships.find(ship => ship.id === id);
                ship.onMission = currentTick + missionLength;

                return ships;
            });
        },
        checkMissions: () => {
            update(ships => {
                if (ships.length < 1) return [];

                ships.map(ship => {
                    if (ship.onMission !== false && ship.onMission < currentTick) {
                        // Back from mission
                        ship.onMission = false;
                        goods.add('doubloons', 100);
                    }
                });

                return ships;
            });
        }
    };
}

export const ships = shipsStore();

getStateFromDb(tableName)
    .then(value => {
        ships.updateAll(value);
    })
    .catch(err => {
        ships.updateAll([getRandomShip()]);
    })
    .finally(() => {
        ships.subscribe(value => {
            saveStateToDb(tableName, value);
        });
    });

ticker.subscribe(value => {
    currentTick = value;
    ships.checkMissions();
});
