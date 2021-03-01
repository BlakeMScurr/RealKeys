// TODO: read papers to understand how to implement (or at least appraise existing) polyphonic pitch detection algorithms
// - https://core.ac.uk/download/pdf/19152713.pdf
// - https://mitpress.mit.edu/books/computer-music-tutorial
// - https://dsp.stackexchange.com/questions/11433/polyphonic-detection-mulit-pitch-detection-chord-recognition
// - https://link.springer.com/chapter/10.1007/978-3-642-34478-7_18
// - https://arxiv.org/pdf/1804.02918.pdf
// - https://www.researchgate.net/publication/331205992_Real-Time_Polyphonic_Pitch_Detection_on_Acoustic_Musical_Signals
// - https://stackoverflow.com/questions/9613768/multiple-pitch-detection-fft-or-other/9626849#9626849
// - https://asa.scitation.org/doi/10.1121/10.0001468?af=R&feed=most-recent
// - https://github.com/yump/doamusic
// - https://github.com/pchao6/Sound_Localization_Algorithms
// - https://towardsdatascience.com/audio-classification-using-fastai-and-on-the-fly-frequency-transforms-4dbe1b540f89

// from https://github.com/cwilso/PitchDetect/pull/23
export function autoCorrelate( buf, sampleRate ) {
	// Implements the ACF2+ algorithm
	var SIZE = buf.length;
	var rms = 0;

	for (var i=0;i<SIZE;i++) {
		var val = buf[i];
		rms += val*val;
	}
	rms = Math.sqrt(rms/SIZE);
	if (rms<0.01) // not enough signal
		return -1;

	var r1=0, r2=SIZE-1, thres=0.2;
	for (var i=0; i<SIZE/2; i++)
		if (Math.abs(buf[i])<thres) { r1=i; break; }
	for (var i=1; i<SIZE/2; i++)
		if (Math.abs(buf[SIZE-i])<thres) { r2=SIZE-i; break; }

	buf = buf.slice(r1,r2);
	SIZE = buf.length;

	var c = new Array(SIZE).fill(0);
	for (var i=0; i<SIZE; i++)
		for (var j=0; j<SIZE-i; j++)
			c[i] = c[i] + buf[j]*buf[j+i];

	var d=0; while (c[d]>c[d+1]) d++;
	var maxval=-1, maxpos=-1;
	for (var i=d; i<SIZE; i++) {
		if (c[i] > maxval) {
			maxval = c[i];
			maxpos = i;
		}
	}
	var T0 = maxpos;

	var x1=c[T0-1], x2=c[T0], x3=c[T0+1];
	let a = (x1 + x3 - 2*x2)/2;
	let b = (x3 - x1)/2;
	if (a) T0 = T0 - b/(2*a);

	return sampleRate/T0;
}