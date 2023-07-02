var onnxSession;
var calls = 0;

startOnnxSession = function() {
	ort.env.wasm.numThreads = navigator.hardwareConcurrency;
	const input = document.createElement('input');
	input.type = 'file';
	input.accept = '.onnx';
	input.onchange = function(e) {
		const file = e.target.files[0]; 
		const reader = new FileReader();
		reader.readAsArrayBuffer(file);
		Module.onnx("loading", file.name.substring(0, file.name.length - 5));
		reader.onload = async function() {
			const arrayBuffer = reader.result;
			const uint8View = new Uint8Array(arrayBuffer);
  			onnxSession = await ort.InferenceSession.create(uint8View, {executionProviders: ["wasm"] });
			Module.onnx("loaded", file.name.substring(0, file.name.length - 5));
		}
	};	
	input.click();
}

onnxInference = function(textInput) {
	gptLoop(textInput, ++calls);
}

async function gptLoop(textInput, id) {
	Module.onnx("inference", textInput);
	var textOutput = textInput;
	var generatedToken = 0;
	var bigInt64Array = [];
	var bigInt64Array2 = [];
	const tokens = GPTTokenizer_p50k_edit.encode(textOutput);
	for (let i = 0; i < tokens.length; i++) {
		bigInt64Array[i] = BigInt(tokens[i]);
		bigInt64Array2[i] = 1n;
	}
	while (generatedToken < 256) {
		await new Promise(resolve => setTimeout(resolve, 0));
		if (id !== calls) break;
		generatedToken++;
		bigInt64Array = bigInt64Array.slice(Math.max(bigInt64Array.length - 50, 0));
		bigInt64Array2 = bigInt64Array2.slice(Math.max(bigInt64Array2.length - 50, 0));
		const inputTensor = new ort.Tensor("int64", bigInt64Array, [1, bigInt64Array.length]);
		const attentionTensor = new ort.Tensor("int64", bigInt64Array2, [1, bigInt64Array2.length]);
		const feeds = { input_ids: inputTensor, attention_mask: attentionTensor };
		const results = await onnxSession.run(feeds);
		const outputData = results["logits"].data.slice(50257 * (bigInt64Array.length - 1), 50257 + 50257 * (bigInt64Array.length - 1));
		const entries = Object.entries(outputData);
		const sorted = entries.sort((a, b) => b[1] - a[1]);
		const newToken = parseInt(sorted[randomWithProbability()][0]);
		bigInt64Array.push(BigInt(newToken));
		bigInt64Array2.push(1n);
		var newWord = GPTTokenizer_p50k_edit.decode([newToken]);
		newWord = newWord.replace(/(\r\n|\n|\r)/gm, " ");
		if (newWord != "<|endoftext|>") {
			textOutput = textOutput + newWord;
			const chars = '].!;?)`';
			const lastChar = textOutput.charAt(textOutput.length - 1);
			if (chars.indexOf(lastChar) == 1 || lastChar == "\"") {
				Module.onnx("inference", textOutput);
			}
			console.log("Loop number:", calls, "Token number:", generatedToken, "Generated text:", textOutput);
		} else {
			console.log("End of text!");
			break;
		}
	}
}

function randomWithProbability() {
	const notRandomNumbers = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 3];
	const idx = Math.floor(Math.random() * notRandomNumbers.length);
	return notRandomNumbers[idx];
}
