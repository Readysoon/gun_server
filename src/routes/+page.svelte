<script lang="ts">
  import { onMount } from 'svelte';
  import Gun from 'gun';

  let messages = $state<any[]>([]);
  let newMessage = $state('');
  let gun: any;

  onMount(() => {
    // Connect to your GUN server
    gun = Gun(['http://localhost:8765/gun']);

    // ALLE Daten aus der Datenbank anzeigen - EXAKT wie in index.html
    let allMessages: string[] = [];
    
    // Verwende die gleiche Logik wie in index.html - nur .on() verwenden
    gun.get('shared/data').on((data: any) => {
      if (data) {
        const timestamp = new Date().toLocaleTimeString();
        allMessages.push(`[${timestamp}] shared/data: ${JSON.stringify(data, null, 2)}`);
        
        // Zeige die Nachrichten genau wie in der HTML-App
        messages = allMessages.map(msgStr => ({
          message: msgStr,
          timestamp: new Date().toISOString(),
          sender: 'Database'
        }));
      }
    });
    
    // Debug: Zeige alle verfügbaren Daten
    console.log('GUN connected, listening for data...');
  });

  function sendMessage() {
    if (newMessage.trim()) {
      // Verwende die gleiche Datenstruktur wie in index.html
      const msg = newMessage + ' - ' + new Date().toLocaleTimeString();
      gun.get('shared/data').put({ message: msg });
      newMessage = '';
    }
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      sendMessage();
    }
  }
</script>

<main class="container">
  <h1>GUN Database Messages</h1>
  
  <div class="message-input">
    <input 
      type="text" 
      placeholder="Enter your message..." 
      bind:value={newMessage}
      on:keypress={handleKeyPress}
    />
    <button on:click={sendMessage}>Send</button>
  </div>

  <div class="messages-container">
    <h2>All Messages ({messages.length})</h2>
    <div class="messages">
      {#each messages as message, index}
        <div class="message">
          <div class="message-content">
            <strong>{message.sender || 'Unknown'}</strong>
            <span class="timestamp">
              {new Date(message.timestamp).toLocaleString()}
            </span>
          </div>
          <div class="message-text">{message.message}</div>
        </div>
      {:else}
        <p class="no-messages">No messages yet. Send one to get started!</p>
      {/each}
    </div>
  </div>
</main>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  }

  h1 {
    text-align: center;
    color: #333;
    margin-bottom: 30px;
  }

  .message-input {
    display: flex;
    gap: 10px;
    margin-bottom: 30px;
  }

  input {
    flex: 1;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 16px;
  }

  button {
    padding: 12px 24px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
  }

  button:hover {
    background-color: #0056b3;
  }

  .messages-container {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 20px;
  }

  h2 {
    margin-top: 0;
    color: #495057;
  }

  .messages {
    max-height: 400px;
    overflow-y: auto;
  }

  .message {
    background: white;
    border: 1px solid #e9ecef;
    border-radius: 6px;
    padding: 15px;
    margin-bottom: 10px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .message-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .timestamp {
    font-size: 12px;
    color: #6c757d;
  }

  .message-text {
    color: #333;
    line-height: 1.4;
  }

  .no-messages {
    text-align: center;
    color: #6c757d;
    font-style: italic;
  }

  @media (prefers-color-scheme: dark) {
    .container {
      background-color: #2f2f2f;
      color: #f6f6f6;
    }

    .messages-container {
      background: #3a3a3a;
    }

    .message {
      background: #4a4a4a;
      border-color: #555;
    }

    input {
      background-color: #3a3a3a;
      color: #f6f6f6;
      border-color: #555;
    }

    button {
      background-color: #007bff;
    }
  }
</style>
