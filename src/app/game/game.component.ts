import { Component, ElementRef, Renderer2 } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent {
  audio: HTMLAudioElement;
  words: string[] = [];
  characterLength: number = 0;
  currentCharacter: number = 0;
  
  stringLength: number = 30;
  rowLength: number = 37;

  constructor(private el: ElementRef, private renderer: Renderer2, private http: HttpClient) { 
    this.audio = new Audio();
    this.audio.src = "assets/click.mp3";
  }

  ngAfterViewInit() {
    this.loadWords();
  }

  loadWords() {
    this.http.get('assets/words.txt', { responseType: 'text' })
      .subscribe(data => {
        this.words = data.split('\n').map(word => word.trim());
        this.generateText(this.words, this.stringLength);
      });
  }

  generateText(wordList: string[], sentenceLength: number) {
    const sentenceArray = [];

    for (let i = 0; i < sentenceLength; i++) {
      const randomIndex = Math.floor(Math.random() * wordList.length);
      sentenceArray.push(wordList[randomIndex]);
    }
    const textElement: HTMLElement = this.el.nativeElement.querySelector('.text');
    textElement.innerHTML = sentenceArray.join(' ');

    this.loadText(textElement);
  }

  loadText(textElement: HTMLElement) {
    console.log("Loaded text");

    if (textElement) {
      const characters = textElement.innerHTML.toLowerCase().split("");
      textElement.innerHTML = "";

      let temp = 0;
      characters.forEach((character) => {
        const characterElement = this.renderer.createElement('span');
        this.renderer.setProperty(characterElement, 'innerHTML', character);
        this.renderer.addClass(characterElement, 'character');
        this.renderer.appendChild(textElement, characterElement);
        temp++;
        this.characterLength++;
        if(temp > this.rowLength && character === " ") {
          const br = this.renderer.createElement('br');
          this.renderer.appendChild(textElement, br);
          temp = 0;
        }
      });
      const characterElement = this.renderer.createElement('span');
      this.renderer.addClass(characterElement, 'character');
      this.renderer.appendChild(textElement, characterElement);
    }
    this.typeMark();
  }

  keyClicked(inputElement: HTMLInputElement) {
    console.log("Current: " + this.currentCharacter + " Length: " + this.characterLength);
    this.audio.currentTime = 0;
    this.audio.play();

    if(this.currentCharacter === this.characterLength) {
      this.newText();
    } 
    else {
      console.log("Next character")
      this.checkCharacter(inputElement);
      this.currentCharacter = inputElement.value.length;
      this.typeMark();
      console.log(this.currentCharacter)
    }
  }

  checkCharacter(inputElement: HTMLInputElement) {
    const characters = this.el.nativeElement.querySelectorAll('.character');
    const typedCharacter = inputElement.value[this.currentCharacter];
    const rightCharacter = characters[this.currentCharacter].innerHTML;
    console.log("Typed: " + typedCharacter + " Right: " + rightCharacter)

    if(typedCharacter === undefined) {
      console.log("Undefined");
      this.renderer.removeClass(characters[this.currentCharacter-1], 'wrong');
      this.renderer.removeClass(characters[this.currentCharacter-1], 'correct');
    }

    else if(typedCharacter === rightCharacter) {
    this.renderer.removeClass(characters[this.currentCharacter], 'wrong');
    this.renderer.addClass(characters[this.currentCharacter], 'correct');
    console.log("Right");
    }

    else {
      this.renderer.removeClass(characters[this.currentCharacter], 'correct');
      this.renderer.addClass(characters[this.currentCharacter], 'wrong');
    }
  }

  typeMark() {
    const characterElements = this.el.nativeElement.querySelectorAll('.character');
    const currentCharacterElement = characterElements[this.currentCharacter];
    
    //remove current class from all characters
    characterElements.forEach((char: HTMLElement) => {
      char.classList.remove('current');
    });

    this.renderer.addClass(currentCharacterElement, 'current');
  }

  newText() {
    console.log("New text");
    this.loadWords();
    this.currentCharacter = 0;
    this.characterLength = 0;
    this.el.nativeElement.querySelector('input').value = "";
  }

  changeInputState(isTyping: boolean) {
    const inputElement = this.el.nativeElement.querySelector('.text');
    if(isTyping) {
      inputElement.classList.remove('not-typing');
      inputElement.classList.add('typing');
      console.log("Typing");
      this.typeMark();
    }
    else {
      inputElement.classList.remove('typing');
      inputElement.classList.add('not-typing');
      console.log("Not typing");
    }
  }

}
