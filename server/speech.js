import gtts from 'gtts';

export function createSpeech(prompt, res) {
  const gttsInstance = new gtts(prompt, 'en');
  gttsInstance.save('response.mp3', function (err, result) {
    if (err) {
      console.log(err);
      res.status(500).send('Error generating speech');
    } else {
      res.sendFile('response.mp3', { root: __dirname });
    }
  });
}
