import { OpenSheetMusicDisplay, Cursor, VoiceEntry, Note, StemDirectionType, PageFormat, unitInPixels, Fraction, SourceMeasure } from "opensheetmusicdisplay";
import { content } from "./exampleContent"

export class Score {
	currentPage: number;
	container: HTMLElement;
	osmd: OpenSheetMusicDisplay;
	constructor(){
		this.currentPage = 0
		this.container = <HTMLElement>document.querySelector("#score");
		this.osmd = new OpenSheetMusicDisplay(this.container, {autoResize: false});
	}

	// Moves to the correct page and displays all previous notes as either having been successfully hit or not
	findLocation(seconds: number) {
		var sheet = this.osmd.Sheet

		var measureLength = (measure: SourceMeasure) => {
			// gives number of seconds in the measure
			return 1 / (measure.TempoInBPM / 60) * measure.ActiveTimeSignature.Denominator
		}

		// Seek location by looping through bars
		// TODO: use a less intensive structure/algorithm, perhaps one that doesn't have to loop every time this function is called
		// Possibly by keeping track of the current bar and using sheet.getListOfMeasuresFromIndeces
		var position = 0;
		for (var i = 0; i < sheet.SourceMeasures.length; i++) {
			var measure = sheet.SourceMeasures[i] 
			var length = measureLength(measure)
			if (position < seconds) {
				// the true location must be in a later bar
				position += length
			} else {
				// TODO: finding the particular note in question rather than returning the time at the start of the bar
				return i
			}
		}
			

		console.log(sheet.getSourceMeasureFromTimeStamp(new Fraction(seconds, sheet.DefaultStartTempoInBpm)))
	}

	nextPage() {
		if (this.currentPage < this.container.childElementCount - 1) {
			this.currentPage++
		}
		this.displayPages()
	}

	previousPage () {
		if (this.currentPage > 0) {
			this.currentPage--
		}
		this.displayPages()
	}

	displayPages () {
		var pages = this.container.children
		for (var i = 0; i < pages.length; i++) {
			var page = <HTMLDivElement>pages.item(i)
			if (i == this.currentPage) {
				page.style.display = "inline"
			} else {
				page.style.display = "none"
			}
		}
	}

	render () {
		document.body.appendChild(this.container);

		let h = window.innerHeight * 0.75
		this.container.style.height = h + ""
		var pixelToCM = 0.2645833333
		this.osmd.setCustomPageFormat(window.innerWidth * pixelToCM, h * pixelToCM)
		this.osmd.setLogLevel('info');

		this.osmd
			.load(content)
			.then(
				() => {
					this.osmd.render();
					afterRender();
				},
				(err) => console.log(err)
			);

		/** Some example code to use OSMD classes after rendering a score. */
		let osmd: OpenSheetMusicDisplay;
		function afterRender() {
			let cursor: Cursor = osmd.cursor;
			cursor.show();
			cursor.next();
			const cursorVoiceEntry: VoiceEntry = cursor.Iterator.CurrentVoiceEntries[0];
			const baseNote: Note = cursorVoiceEntry.Notes[0];
			console.log("Stem direction of VoiceEntry under Cursor: " + StemDirectionType[cursorVoiceEntry.StemDirection]);
			console.log("base note of Voice Entry at second cursor position: " + baseNote.Pitch.ToString());

			osmd.setOptions( { autoResize: true });
		}

		setInterval(()=>{
			this.displayPages()
		}, 1000)
	}
}
