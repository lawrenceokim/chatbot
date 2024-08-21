"use client";
import React, { useState, useEffect, KeyboardEvent, ChangeEvent } from "react";

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

interface Message {
  text: string;
  role: string;
  timestamp: Date;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>("");
  const [chat, setChat] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const apiKey = "AIzaSyB***************************"; // werey🤪
  const MODEL_NAME = "gemini-1.5-pro";
  const genAI = new GoogleGenerativeAI(apiKey);

  const generationConfig = {
    temperature: 0.9,
    topP: 1,
    topK: 1,
    maxOutputTokens: 2048,
    responseMimeType: "text/plain",
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  useEffect(() => {
    const initChat = async () => {
      try {
        const newChat = await genAI
          .getGenerativeModel({ model: MODEL_NAME })
          .startChat({
            generationConfig,
            safetySettings,
            history: messages.map((msg) => ({
              role: msg.role,
              parts: [
                {
                  text: msg.text,
                },
              ],
              // text: msg.text,
            })),
          });
        setChat(newChat);
      } catch (error) {
        setError("Failed to initialize chat. Please try again.");
      }
    };
    initChat();
  }, []);

  const handleSendMessage = async () => {
    try {
      const userMessage: Message = {
        text: userInput,
        role: "user",
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setUserInput("");

      if (chat) {
        const result = await chat.sendMessage(userInput);
        const response = result.response;
        const text = response.text();
        const botMessage: Message = {
          text: text,
          role: "bot",
          timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      }
    } catch (error) {
      setError("Failed to send message. Please try again.");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Gemini Chat</h1>
      </div>
      <div className="flex-1 overflow-y-auto rounded-md p-2">
        {messages.map((msg, index) => (
          <div
            className={`mb-4 ${
              msg.role === "user" ? "text-right" : "text-left"
            }`}
            key={index}
          >
            <span
              className={`p-2 rounded-lg ${
                msg.role === "user" ? "text-red-500" : "text-green-500"
              }`}
            >
              {msg.text}
            </span>
            <p className="text-xs mt-1">
              {msg.role === "bot" ? "BOT" : "YOU"}{" "}
              {msg.timestamp.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      <div className="flex items-center mt-4">
        <input
          type="text"
          placeholder="Type your message..."
          value={userInput}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setUserInput(e.target.value)
          }
          onKeyDown={handleKeyPress}
          className="flex-1 p-2 rounded-l-md border-b border-l focus:outline-none focus:border-blue-400 text-black"
        />
        <button
          className="px-3 h-full bg-green-500 ml-3 text-white rounded-r-md hover:bg-opacity-80 focus:outline-none"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
