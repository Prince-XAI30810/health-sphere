import os
import azure.cognitiveservices.speech as speechsdk
from config.config import Config
import time

class AzureSpeechHelper:
    def __init__(self):
        self.speech_key = Config.SPEECH_KEY
        self.speech_region = Config.SPEECH_REGION
        self.speech_config = speechsdk.SpeechConfig(subscription=self.speech_key, region=self.speech_region)
        self.LANGUAGE_IDS = ["en-US", "hi-IN", "mr-IN"]
        self.speech_synthesizer = None  # Store synthesizer instance

    def speech_to_recognize_from_microphone(self):
        """Automatically detects the spoken language and transcribes speech using Azure Speech-to-Text."""
        
        if not self.speech_key or not self.speech_region:
            print("Error: Missing SPEECH_KEY or SPEECH_REGION environment variables.")
            return

        # Configure speech recognition with auto-detect
        auto_detect_source_language_config = speechsdk.languageconfig.AutoDetectSourceLanguageConfig(languages=self.LANGUAGE_IDS)
        audio_config = speechsdk.audio.AudioConfig(use_default_microphone=True)
        speech_recognizer = speechsdk.SpeechRecognizer(
            speech_config=self.speech_config, 
            audio_config=audio_config, 
            auto_detect_source_language_config=auto_detect_source_language_config
        )
        
        start_time = time.time()
        print("Speak into your microphone... (Detecting language)")

        # Call the recognize_once_async method for one-time recognition
        speech_recognition_result = speech_recognizer.recognize_once_async().get()

        # Handle recognition results
        if speech_recognition_result.reason == speechsdk.ResultReason.RecognizedSpeech:
            detected_language = speech_recognition_result.properties[
                speechsdk.PropertyId.SpeechServiceConnection_AutoDetectSourceLanguageResult
            ]
            end_time = time.time()
            print(f"Detected Language: {detected_language}")
            print(f"Recognized Text: {speech_recognition_result.text}")
            print(f"Time taken: {end_time - start_time} seconds")
        elif speech_recognition_result.reason == speechsdk.ResultReason.NoMatch:
            print("No speech could be recognized.")
        elif speech_recognition_result.reason == speechsdk.ResultReason.Canceled:
            cancellation_details = speech_recognition_result.cancellation_details
            print(f"Speech Recognition canceled: {cancellation_details.reason}")
            if cancellation_details.reason == speechsdk.CancellationReason.Error:
                print(f"Error details: {cancellation_details.error_details}")

        return speech_recognition_result.text

    def get_speech_config(self):
        """Returns the SpeechConfig object."""
        if not self.speech_key or not self.speech_region:
            raise ValueError("Missing Azure Speech credentials. Set 'SPEECH_KEY' and 'SPEECH_REGION' as environment variables.")
        
        speech_config = speechsdk.SpeechConfig(subscription=self.speech_key, region=self.speech_region)
        speech_config.speech_synthesis_voice_name = 'en-US-AvaMultilingualNeural'  # Supports multiple languages
        return speech_config

    def synthesize_speech(self, text):
        """Converts input text to speech and plays it on the default speaker."""
        try:
            speech_config = self.get_speech_config()
            audio_config = speechsdk.audio.AudioOutputConfig(use_default_speaker=True)
            self.speech_synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=audio_config)
            
            start_time = time.time()
            result = self.speech_synthesizer.speak_text_async(text).get()
            end_time = time.time()

            if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
                print(f"✅ Speech synthesized for text: {text}")
                print(f"Time taken: {end_time - start_time} seconds")
            elif result.reason == speechsdk.ResultReason.Canceled:
                print(f"❌ Speech synthesis canceled: {result.cancellation_details.reason}")
                if result.cancellation_details.reason == speechsdk.CancellationReason.Error:
                    print(f"Error details: {result.cancellation_details.error_details}")
        except Exception as e:
            print(f"⚠️ Error: {e}")

    def stop_speech(self):
        """Stops the speech synthesis immediately."""
        if self.speech_synthesizer:
            print("⏹️ Stopping speech synthesis...")
            self.speech_synthesizer.stop_speaking_async()
            self.speech_synthesizer = None  # Reset the synthesizer instance
        else:
            print("⚠️ No speech synthesis is currently active.")

    def transcribe_from_file(self, audio_file_path: str) -> str:
        """
        Transcribes audio from a .wav file using Azure Speech-to-Text.
        Uses continuous recognition to handle longer recordings.
        
        Args:
            audio_file_path: Path to the .wav audio file
            
        Returns:
            str: The complete transcription of the audio file
        """
        if not self.speech_key or not self.speech_region:
            print("Error: Missing SPEECH_KEY or SPEECH_REGION environment variables.")
            return ""

        try:
            # Configure audio input from file
            audio_config = speechsdk.audio.AudioConfig(filename=audio_file_path)
            
            # Configure speech recognition with auto-detect language
            auto_detect_source_language_config = speechsdk.languageconfig.AutoDetectSourceLanguageConfig(
                languages=self.LANGUAGE_IDS
            )
            
            speech_recognizer = speechsdk.SpeechRecognizer(
                speech_config=self.speech_config,
                audio_config=audio_config,
                auto_detect_source_language_config=auto_detect_source_language_config
            )

            # Storage for transcription results
            transcription_results = []
            done = False

            def recognized_cb(evt):
                """Callback for recognized speech"""
                if evt.result.reason == speechsdk.ResultReason.RecognizedSpeech:
                    transcription_results.append(evt.result.text)
                    print(f"Recognized: {evt.result.text}")

            def session_stopped_cb(evt):
                """Callback for session stopped"""
                nonlocal done
                print("Session stopped.")
                done = True

            def canceled_cb(evt):
                """Callback for canceled recognition"""
                nonlocal done
                print(f"Recognition canceled: {evt.cancellation_details.reason}")
                if evt.cancellation_details.reason == speechsdk.CancellationReason.Error:
                    print(f"Error details: {evt.cancellation_details.error_details}")
                done = True

            # Connect callbacks
            speech_recognizer.recognized.connect(recognized_cb)
            speech_recognizer.session_stopped.connect(session_stopped_cb)
            speech_recognizer.canceled.connect(canceled_cb)

            # Start continuous recognition
            print(f"Starting transcription of: {audio_file_path}")
            speech_recognizer.start_continuous_recognition()

            # Wait for recognition to complete
            import time
            while not done:
                time.sleep(0.5)

            speech_recognizer.stop_continuous_recognition()

            # Join all recognized text
            full_transcript = " ".join(transcription_results)
            print(f"Full transcription: {full_transcript}")
            
            return full_transcript

        except Exception as e:
            print(f"Error transcribing audio file: {e}")
            return ""
