import express from 'express';
import net from 'net';

const app = express()
// Create a TCP client
const client = new net.Socket();


const port = 502; // Replace with the device's port number
const host = 'munheanvn.dyndns.org'; // Replace with the device's IP address

function testTCPConnection(host: string, port: number, timeout = 3000) {
  return new Promise<void>((resolve, reject) => {
    const socket = new net.Socket();

    // Timeout if the connection takes too long
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error('Connection timed out'));
    }, timeout);

    socket.connect(port, host, async () => {
      //clearTimeout(timer);
      // Construct the request buffer with the register address
      //const requestBuffer = Buffer.from([19000]);

      // Send the request to the device
      //await socket.write(requestBuffer);

      await socket.on('data', (data) => {
        const hexData = data.toString('hex')
        console.log("data in hex", hexData);
        // Process the received data here
      });
      //socket.end();
      
       // Handle connection termination
       await socket.on('close', () => {
        reject(new Error('Connection closed unexpectedly'));
      });

      // Handle connection errors
      await socket.on('error', (error) => {
        reject(error);
      });
    });

    socket.on('error', (error) => {
      clearTimeout(timer);
      console.log("reject");
      reject(error);
    });

    resolve();
  });
}

app.get('/', async (req, res) => {
    await testTCPConnection(host, port)
    res.send('hello world! ');
})

app.listen(4321, ()=> {
    // Connect to the device
    client.connect(port, host, async () => {
        console.log('Connected to device');
        await testTCPConnection(host, port)
        .then(() => {
          console.log('TCP connection successful');
        })
        .catch((error) => {
          console.error('TCP connection failed:', error);
        });

        // Send data to the device
        console.log('connection to ok');
        
        // const data = 'Hello, device!';
        // client.write(data);
    });

    // Handle device responses
  client.on('data', data => {
    console.log('Received from device:', data.toString());
  });
  
  // Handle connection termination
  client.on('close', () => {
    console.log('Connection closed');
  });
  
    console.log('Server running on Port 4321');
})