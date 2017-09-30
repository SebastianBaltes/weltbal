import WUniverse from './WUniverse';

const universe = new WUniverse();

self.addEventListener('message', (event) => {
    const result = universe.update(event.data.time); 
    self.postMessage(result);
});
