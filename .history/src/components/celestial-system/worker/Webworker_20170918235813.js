const celestial = new Celestial();

// Respond to message from parent thread
self.addEventListener('execute', (event) => { 
    console.log('Webworker.execute',event); 
    


    // Post data to parent thread
    self.postMessage({foo: 'foo'}) 
});
