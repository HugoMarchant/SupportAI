import React, { useState, useEffect } from 'react';
import './Chat.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons'
const { Configuration, OpenAIApi } = require("openai");


interface ChatProps {}

interface Message {
  id: number;
  text: string;
  user: string;
}

const Chat: React.FC<ChatProps> = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<string>('Agent');
  const [lines, setLines] = useState(1);
  const [lineHeight, setLineHeight] = useState(0);

  useEffect(() => {
    const textarea = document.getElementById('textarea') as HTMLTextAreaElement;
    setLineHeight(textarea.offsetHeight / 2);
  }, []);
  
  useEffect(() => {
    const textarea = document.getElementById('textarea') as HTMLTextAreaElement;
    textarea.style.height = `${Math.min(lines, 4) * lineHeight}px`;
  }, [lines, lineHeight]);
  
  const configuration = new Configuration({
    apiKey: "[ENTER YOUR OPENAI API KEY HERE]",
  });
  const openai = new OpenAIApi(configuration);

  const systemTextGPT35Turbo = `You are a helpful customer service assistant for the company \
Vodafone UK. Your task is to think step by step and suggest a message that a customer \
service agent for Vodafone should reply with. You have been given a history of the conversation \
that the user John Smith has had up to now and you will try to provide an answer based on \
the information provided to you. Keep answers clear and concise.

  You are going to be provided with data about John Smith to help you answer \
their questions. John Smith has already provided their account number and is already authenticated.
  
  Billing history for John Smith in yaml format:
  ---
  - 1:
    date: 2023-04-25
    amount: 33.00
    lines:
      - 01234567890:
        amount: 22.00
        out-of-bundle-charges: 0.00
        out-of-bundle-products:
      - 09876543210:
        amount: 6.00
        out-of-bundle-charges: 5.00
        out-of-bundle-products:
          - 1:
            name: 100 International Minutes
            amount: 5.00
            reoccuring: true
            date-added: 2023-04-15
  - 2:
    date: 2023-03-25
    amount: 28.00
    lines:
      - 01234567890:
        amount: 22.00
        out-of-bundle-charges: 0.00
        out-of-bundle-products:
      - 09876543210:
        amount: 6.00
        out-of-bundle-charges: 0.00
        out-of-bundle-products:

  Now, based on this information and the conversation history so far please suggest an answer \
that the customer service agent respond with:

  `;

  const handleWandClick = async () => {
    try {
      let apiMessages = [
        {
          role: "system",
          content: systemTextGPT35Turbo
        }
      ];

      // Convert your messages to the API format
      messages.slice().reverse().forEach((message: Message) => {
        // Map messages to start of array

        apiMessages.unshift({
          role: message.user === "agent" ? "assistant" : "user",
          content: message.text
        });
      });

      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: apiMessages,
        max_tokens: 500,
        temperature: 0.5
      });

      const completionText = completion.data.choices[0].message.content.trim();
      console.log(completionText);
      setInput(completionText); // Set the input to the generated text
      setLines(completionText.split('\n').length); // Set the number of lines

      
    }
    catch (error) {
      console.error(error);
    }
  };


  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // Prevent page refresh
    if (input) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: input.trim(),
        user: currentUser.toLowerCase(),
      };

      setMessages([...messages, newMessage]);
      setInput('');
      setLines(1);
    }
  };

  const toggleUser = () => {
    setCurrentUser((prevUser) => (prevUser === 'Agent' ? 'Customer' : 'Agent'));
  };

  return (
    <div className="container">
      <div className="messages">
        {messages.map((message: Message) => (
          <div key={message.id} className={`messageContainer ${message.user}`}>
            <div className={`message ${message.user}`}>
              {message.text}
            </div>
          </div>
        ))}
      </div>
      <div className="inputArea">
        <button className="toggler" onClick={toggleUser}>
          {currentUser === 'Agent' ? 'Agent' : 'Customer'}
        </button>
        <form onSubmit={handleSubmit} style={{ flex: 1 }}>
        <textarea
          id="textarea"
          rows={1}
          value={input}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          onChange={e => {
            setInput(e.target.value);
            setLines(e.target.value.split('\n').length);
          }}
        />
          <button onClick={handleWandClick}>
          <FontAwesomeIcon icon={faWandMagicSparkles} />
          </button>
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
