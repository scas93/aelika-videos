import {Config} from '@remotion/cli/config';

// Si tienes un Chromium propio, indícalo con la variable REMOTION_BROWSER.
if (process.env.REMOTION_BROWSER) Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
