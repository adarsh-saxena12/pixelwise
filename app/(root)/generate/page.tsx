
"use client";

import React, { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
import { Sparkles, Image as ImageIcon, X, Download, ArrowRight, Mic, MicOff, MicIcon } from "lucide-react";
import formatText from "@/components/shared/FormatText";
import { ImageCard } from "@/components/shared/ImageCard";
import {examplePrompts} from "@/constants/index";

//complete type definitions for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  interpretation: any;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: Event) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
  prototype: SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface GenerateResponse {
  text: string;
  images: string[];  
}

export default function Home() {  
  const [prompt, setPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedContents, setGeneratedContents] = useState<GenerateResponse[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (generatedContents.length > 0) {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [generatedContents]);

  useEffect(() => {
    // Checking if SpeechRecognition is available in the browser
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognitionAPI) {
        recognitionRef.current = new SpeechRecognitionAPI();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onstart = () => {
          setIsListening(true);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          setPrompt(transcript);
        };
      }
    }
  }, []);

  const handlePromptChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setPrompt(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void generateImage();
    }
  };

  const generateImage = async (): Promise<void> => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setErrorMessage(null);
    
    try {
      const response = await fetch("/api/createImage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate image: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if ("error" in data && data.error) {
        throw new Error(data.error as string);
      }
      
      setGeneratedContents(prev => [...prev, data as GenerateResponse]);
      setPrompt("");
      setHasGenerated(true);

    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6">
          
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-2 mb-6">
              <X className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p>{errorMessage}</p>
            </div>
          )}
           {/* example prompts */}
           {!hasGenerated && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 ">
              {examplePrompts.map((example, index) => (
                <button 
                  key={index}
                  onClick={() => setPrompt(example.prompt)}
                  className="p-5 rounded-xl text-left transition-all duration-200 bg-white border light:border-indigo-200 hover:shadow-md hover:bg-indigo-50 hover:scale-105 dark:bg-[#1e2127] light:bg-gradient-to-r light:from-indigo-200 light:to-violet-200"
                  type="button"
                >
                  <h4 className="font-semibold text-gray-800 mb-1 dark:text-gray-300">{example.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{example.prompt}</p>
                </button>
              ))}
            </div>
          )}
          <div ref={contentRef} className="space-y-8">
            {!isGenerating ? generatedContents.map((content, contentIndex) => (
              <div key={contentIndex} className="p-6">
                {content.text && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                    <div className="text-gray-600 leading-relaxed">{formatText(content.text)}</div>
                  </div>
                )}
                
                {content.images && content.images.length > 0 && (
                  <div className="grid gap-6">
                    {content.images.map((image, index) => (
                      <ImageCard key={index} imageUrl={image} index={index}/>
                    ))}
                  </div>
                )}
              </div>
            )): (
              
                <div className="flex flex-col w-full h-[500px] items-center justify-center gap-2 rounded-[10px] border bg-dark-400/90 p-4">
                    <img
                    src="/assets/icons/spinner.svg"
                     alt="spinner"
                     width={50}
                     height={50}
              
                />
                <p className="text-white/80">Generating...</p>
              </div>
                               
            )}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white p-6 dark:bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="relative flex items-center">
            <textarea
              className="w-full border-[1px] rounded-xl p-4 pr-16 focus:outline-none dark:focus:border-indigo-600 dark:text-gray-300 min-h-[120px] resize-none text-gray-700 placeholder-gray-400"
              value={prompt}
              onChange={handlePromptChange}
              onKeyDown={handleKeyDown}
              placeholder="Describe the image you want to generate..."
              disabled={isGenerating}
            />

            <button
              onClick={startListening}
              disabled={isGenerating}
              className={`absolute bottom-3 right-16 rounded-xl p-3 transition-all 
              ${isListening ? "bg-red-500" : "bg-gradient-to-r from-indigo-600 to-purple-600"} text-white shadow-md`}
            >
              {isListening ? <MicIcon className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => void generateImage()}
              disabled={isGenerating || !prompt.trim()}
              className="absolute bottom-3 right-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-3 font-medium text-white shadow-md"
            >
              {isGenerating ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}