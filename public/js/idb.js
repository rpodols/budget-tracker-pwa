let db;

const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_trx', { autoIncrement: true });
  };

request.onsuccess = function(event) {
   db = event.target.result;
  

    if (navigator.onLine) {
        uploadTrx();
    }
  };
  
  request.onerror = function(event) {
    console.log(event.target.errorCode);
  };

function saveRecord(record) {
    const transaction = db.transaction(['new_trx'], 'readwrite');
 
    const transactionObjectStore = transaction.objectStore('new_trx');
  
    transactionObjectStore.add(record);
  }

  function uploadTrx() {
    const transaction = db.transaction(['new_trx'], 'readwrite');
  
    const transactionObjectStore = transaction.objectStore('new_trx');
  
    const getAll = transactionObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
        fetch('/api/transaction', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(serverResponse => {
            if (serverResponse.message) {
                throw new Error(serverResponse);
            }

            const transaction = db.transaction(['new_trx'], 'readwrite');
            const transactionObjectStore = transaction.objectStore('new_trx');
            transactionObjectStore.clear();

            alert('All saved transactions has been submitted!');
            })
            .catch(err => {
            console.log(err);
            });
        }
    };
  }

  window.addEventListener('online', uploadTrx);