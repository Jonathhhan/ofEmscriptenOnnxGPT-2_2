#pragma once

#include "ofMain.h"
#include "ofxParagraph.h"
#include "gui/bang.h"

#include "emscripten.h"
#include "emscripten/bind.h"

class ofApp : public ofBaseApp{

	public:
		void setup();
		void update();
		void draw();

		void keyPressed(int key);
		void keyReleased(int key);
		void mouseMoved(int x, int y);
		void mouseDragged(int x, int y, int button);
		void mousePressed(int x, int y, int button);
		void mouseReleased(int x, int y, int button);
		void mouseEntered(int x, int y);
		void mouseExited(int x, int y);
		void windowResized(int w, int h);
		void dragEvent(ofDragInfo dragInfo);
		void gotMessage(ofMessage msg);
		void bang_1_event(bool & e);
		ofxParagraph paragraph;
		ofxParagraph paragraph2;
		ofxParagraph paragraph3;
		std::string textInput;
		bang bang_1;
};
