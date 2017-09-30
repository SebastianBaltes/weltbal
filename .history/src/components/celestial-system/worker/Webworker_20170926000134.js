import WUniverse from './WUniverse';

const universe = new WUniverse();

self.addEventListener('message', (event) => {
    // console.time('wuniverse.update');
    const result = universe.update(event.data.time); 
    // console.timeEnd('wuniverse.update');
    self.postMessage(result);
});
