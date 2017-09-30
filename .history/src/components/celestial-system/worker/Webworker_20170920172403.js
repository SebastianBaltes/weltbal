import WUniverse from './WUniverse';

const universe = new WUniverse();

self.addEventListener('message', (event) => {
    const t0 = Date.now();
    const result = universe.update(event.data.time); 
    console.log('universe.update ms: ',Date.now()-t0);
    self.postMessage(result);
});
