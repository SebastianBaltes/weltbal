import Universe from './Universe';

const universe = new Universe();

self.addEventListener('message', (event) => {
    const result = universe.update(event.time); 
    self.postMessage(result);
});
