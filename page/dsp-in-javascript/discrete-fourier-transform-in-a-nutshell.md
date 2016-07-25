## Data transmission over sound in JavaScript - part 1 - Discrete Fourier Transform

JavaScript is amazingly powerful
During last years JavaScript becase
  
Nowadays JavaScript is 
tell about JS and capabilities
Web Audio API -> access to microphone and speakers
we could go back to old times and modem (do you remember that sound?)
the goal build system that allows to send simple data - from scratch! 
before we start we need to understand some basics of DSP
in next 


### Introduction to DFT

Have you ever wondered how all of modern wireless digital devices could work on the same time without interfering? For
example we could use WiFi network (2.4GHz), LTE mobile phone (2100 MHz) and watch DVB-T TV (~500MHz) in parallel.
One of the answer is that they use different frequencies of electromagnetic waves. When we need to deal with
frequencies Fourier Transform will help us. But what it actually does? It changes signal represented in `time domain` 
into `frequency domain`. In other words it is decomposing signal that varies over time into the frequencies
that make it. That allows us for example to tune/pick only specific range of frequencies from full spectrum.
In case of sound waves output of Discrete Fourier Transform is often showed on music player window or on radio
LCD. Apart from nice looking bouncing bars we can also read from that output how loud each frequency range is.
We can for example read without even listening to the song how fast is the bass beat.

    IMAGE: 1 seconds of song and few ranges that overlaps

### DFT in fast and slow way

Currently the fastest algorithm for doing that is FFT - Fast Fourier Transform. If you are chatting on your smartphone,
using WiFi or watching TV from Terrestrial DVB transmitter FFT algorithm is running all the time. It's very fast but
unfortunately not that simple. Goal behind this article is to create relatively simple signal processing in
JavaScript from scratch. That's why we will focus on much simpler algorithm that in general will give same result.
There is only one disadvantage - this method is ultra slow. In JavaScript it's possible to compute only couple of
frequency bins (vertical 'bars' on frequency domain chart) in the real time. In comparison FFT will give us thousands
of them.

    IMAGE: speed comparison table?

### Basic DFT algorithm

Before we start lets change the way we express frequency of a sine wave. Instead of using frequency value we can
use samplePerPeriod value. This will allow us to drop frequency in our examples because it's always related to
additional parameter - sampling frequency. At the end we are working with arrays of samples so that would make it
simpler.

    IMAGE: show few sines with different sampling>
    
>Using samplePerPeriod instead frequency will affect horizontal axis of the frequency domain chart (you will see 
>that later). This conversion is not linear so our frequency bins will not be spaced by equal amount of Hertz. For
>needs of this article it's doesn't change much.

Let say we have signal that is made of 3 sine waves. Sine A has samplePerPeriod equal 28, Sine B has samplePerPeriod
equal 20, Sine C has samplePerPeriod equal 16. If you are really curious how much Hertz is that for usual sampling 
rate of 44100Hz it's 1575Hz, 2205Hz and 2756.25Hz respectively (frequencyInHertz = sampleRate / samplePerPeriod). 

    IMAGE: 3 sines alone and summed

By looking at output signal it's really hard to say what are the frequencies that made that signal. It's even hard
to say how many sines are summed together. So how we can extract those frequencies? In first step we need to collect 
proper amount of samples that we will use for later computations. This step is called *windowing*. You can also treat 
it as a animation frame because it will show frequencies of the signal in this exact moment. We cannot compute DFT on 
all samples from the buffer at once. We need to split it into pieces and transform one by one. Ok, lets set our 
window size to 1024 pick this amount of samples from the final signal buffer.

    IMAGE: windowed raw samples

In next step we need to apply window function to our raw samples. The goal is to 'flatten' all samples at left
and right part of the window and keep the middle part in a 'gentle' way. That is important because we want to decompose
our signal to sines waves that make it. The problems is that not all frequencies that we want to see in frequency
domain chart fits in a window in a way that we will have integer multiply of wave period.

    IMAGE: show how sine waves fits the window size

Without window function we would have 'frequency leakage' and main sines waves that makes the signal will not be
visible well as a peaks in frequency domain chart. Image below shows how window function looks like and how
our samples was changed after applying it.

    IMAGE: window function and final samples

In order to create frequency domain representation we need to create second chart. Each vertical bar on the chart is
called frequency bin and tells how much of that frequency is inside our signal from the window. Let say we want to
check frequencies in a range between 10 and 50 samplePerPeriod. To have nice resolution lets compute 160 frequency bins.
This means that frequency bins will be separated by 0.25 samplePerPeriod (50-10/160=0.25). 
Output of Discrete Fourier Transform gives values that varies a lot. Some bins could have value 0.1 since other
could have 0.000001. In order to see all variety of values vertical axis is showed in decibels. 0.1 will be showed
as -10 decibels and 0.000001 will be showed as -60 decibels.

>Decibel goes down to negative value, -60 decibels means much weaker signal than for example -5 decibels.

>All frequency charts have higher frequencies on the right side and lower frequencies on the left side. In our case
>lower samplePerPeriod means value higher frequency because sine have less samples in a period - it's more packed 
>so frequency is higher. That is the reason why we need to put highest samplePerPeriod value on the left and end
>with lowest samplePerPeriod on the right.

Again, if you are really curious about Hertz it will show frequencies between 882Hz and 4410Hz (sampling rate 44100).

    IMAGE: clean frequency domain chart with labels and scale

Ok, let start the most interesting part. How to actually compute Discrete Fourier Transform? We need to perform same
algorithm per each bin which goes like this:

>To get one frequency bin data we need to iterate thought all samples in our window. At each iteration value of the
>sample is multiplied by 2 dimensional unit vector. When we would show that vector from each iteration on 2D chart
>we will see that it's making circles which have period equal to frequencyBin's samplePerPeriod parameter.
>To get power of frequency bin we need to add all of those unit vectors together, divide by number of samples in a
>window and compute length of that final vector. Additionally we can convert that length into decibels.
>Additionally if we measure angle between final vector and positive Y axis clockwise it will be equal to phase of 
>that sine wave.

In our frequency domain chart we decided to have 160 frequency bins. Window size was set earlier to 1024 sample. It
means that to create complete chart we need to do 163 840 iterations (1024 * 160). For better resolutions or bigger
window sizes this number goes up very fast. That's why this basic algorithm is ultra slow.

### Examples - 3 sines and window function enabled

Let's pick some bin as an example because it's always better that a thousands words. Our sines have samplePerPeriods 
28, 20 and 16. To not cheat lets take 'random' samplePerPeriod for example equal to 18. This frequency should not be 
present in our signal window so our expectation is that we should get small decibel value.

[....]
- describe algorithm, running circle [CHART]
- show that we collect vectors per each sample [CHART]
- sum of vectors is power of sin wave frequency that we are looking at, direction is phase of that sine wave

>When frequency that we are examining *is not present* in the signal it will produce vectors that points to many 
>different directions. If we would sum them together they will all cancel each other and length of the final vector
>will be small.

[....]

>When frequency that we are examining *is present* in the signal it will produce more and more vectors that points to 
>the same direction. It's like with swing on the playground. Small force with proper frequency will increase the 
>amplitude of the swing.

### Examples - 1 sine only without window function

### JavaScript implementation

Below you can find simple JavaScript implementation of all that was described above.

```javascript
function computeDiscreteFourierTransform(
    timeDomain, frequencyBinSamplePerPeriodMax, frequencyBinSamplePerPeriodMin, frequencyBinSize
    ) {
    var frequencyDomain, step, i, samplePerPeriod, frequencyBin;

    frequencyDomain = [];
    step = (frequencyBinSamplePerPeriodMax - frequencyBinSamplePerPeriodMin) / frequencyBinSize;
    for (i = 0; i < frequencyBinSize; i++) {
        samplePerPeriod = frequencyBinSamplePerPeriodMax - i * step;
        frequencyBinPowerDecibel = getFrequencyBinPowerDecibel(timeDomain, samplePerPeriod);
        frequencyDomain.push(frequencyBinPowerDecibel);
    }

    return frequencyDomain;
}

function findUnitAngle(x, y) {
    var length, quarter, angle;

    length = Math.sqrt(x * x + y * y);
    length = (length < 0.000001) ? 0.000001 : length;    // prevents from dividing by zero
    quarter = (x >= 0) ? (y >= 0 ? 0 : 1) : (y < 0 ? 2 : 3);
    switch (quarter) {
        case 0:
            angle = Math.asin(x / length);
            break;
        case 1:
            angle = Math.asin(-y / length) + 0.5 * Math.PI;
            break;
        case 2:
            angle = Math.asin(-x / length) + Math.PI;
            break;
        case 3:
            angle = Math.asin(y / length) + 1.5 * Math.PI;
            break;
    }

    return angle / (2 * Math.PI);   // return angle in range: <0, 1)
}

function getFrequencyBinPowerDecibel(timeDomain, samplePerPeriod) {
    var windowSize, real, imm, i, sample, r, power, powerDecibel, phase;

    windowSize = timeDomain.length;            // timeDomain array length is our window size
    real = 0;
    imm = 0;
    for (i = 0; i < windowSize; i++) {
        sample = timeDomain[i];
        r = 2 * Math.PI * i / samplePerPeriod; // compute radians for 'unit vector' sine/cosine
        real += -Math.cos(r) * sample;         // 'sample' value alters 'unit vector' length, it could also change
        imm += Math.sin(r) * sample;           // direction of vector in case of negative 'sample' values
    }
    real /= windowSize;                                         // normalize final vector
    imm /= windowSize;                                          // normalize final vector

    power = Math.sqrt(real * real + imm * imm);                 // compute length of the vector
    powerDecibel = 10 * Math.log(power) / Math.LN10;            // convert into decibels
    powerDecibel = powerDecibel < -80 ? -80 : powerDecibel;     // limit weak values to -80 decibels
    
    phase = findUnitAngle(real, imm);                           // phase is angle

    return {
        powerDecibel: powerDecibel,
        phase: phase
    };
}

function blackmanNuttall(n, N) {
    return 0.3635819
        - 0.4891775 * Math.cos(2 * Math.PI * n / (N - 1))
        + 0.1365995 * Math.cos(4 * Math.PI * n / (N - 1))
        - 0.0106411 * Math.cos(6 * Math.PI * n / (N - 1));
}
```

Code above should be more of less clear. Those 4 functions are enough to compute Discrete Fourier Transform. 
Magic formula at `blackmanNuttall` method was taken from Wikipedia article about 
(Window Function)[https://en.wikipedia.org/wiki/Window_function]. Ok, let's add few sines together and try
to compute DFT:

```javascript
var i, timeDomain, sample, sampleProcessed, windowSize, frequencyDomain;

timeDomain = [];
windowSize = 1024;
// fill array with time domain samples
for (i = 0; i < windowSize; i++) {
    sample = 0;
    sample += 0.3 * Math.sin(2 * Math.PI * i / 28);              // sine A with samplePerPeriod 28
    sample += 0.3 * Math.sin(2 * Math.PI * i / 20);              // sine B with samplePerPeriod 20
    sample += 0.3 * Math.sin(2 * Math.PI * i / 16);              // sine C with samplePerPeriod 16 
    sampleProcessed = sample * blackmanNuttall(i, windowSize);   // apply window function
    timeDomain.push(sampleProcessed);                            // push processed sample to array
}
frequencyDomain = computeDiscreteFourierTransform(timeDomain, 50, 10, 160);  // will give 160 powerDecibel values
                                                                             // starting from samplePerPeriod 50
                                                                             // ending at samplePerPeriod 10.25
                                                                             // with samplePerPeriod step of 0.25

console.log(timeDomain.length);      // --> 1024
console.log(frequencyDomain.length); // --> 160
```

In example above we skip *windowing* step - we directly created final signal inside a time domain window.
Normally we would copy samples from some input buffer.

Lets look what are the power values that we have near our three sines. We expect to see 3 power peaks near 
28, 20 and 16 samplePerPeriod. 

>To compute array index from samplePerPeriod and vice versa we need to use those formulas:
>step = (frequencyBinSamplePerPeriodMax - frequencyBinSamplePerPeriodMin) / frequencyBinSize
>index = (frequencyBinSamplePerPeriodMax - samplePerPeriod) / step
>samplePerPeriod = frequencyBinSamplePerPeriodMax - step * index

```javascript
function logPowerDecibel(index) {
    console.log(frequencyDomain[index].powerDecibel);
}

logPowerDecibel(87); // -12.81 | index: (50-28.25)/0.25 = 87 | samplePerPeriod: 50-0.25*87 = 28.25
logPowerDecibel(88); // -12.64 | index: (50-28.00)/0.25 = 88 | samplePerPeriod: 50-0.25*88 = 28.00 | SINE A
logPowerDecibel(89); // -12.82 | index: (50-27.75)/0.25 = 89 | samplePerPeriod: 50-0.25*89 = 27.75
// ...
logPowerDecibel(104); // -61.48 | index: (50-24.00)/0.25 = 104 | samplePerPeriod: 50-0.25*104 = 24.00
// ...
logPowerDecibel(119); // -13.32 | index: (50-20.25)/0.25 = 119 | samplePerPeriod: 50-0.25*119 = 20.25
logPowerDecibel(120); // -12.64 | index: (50-20.00)/0.25 = 120 | samplePerPeriod: 50-0.25*120 = 20.00 | SINE B
logPowerDecibel(121); // -13.35 | index: (50-19.75)/0.25 = 121 | samplePerPeriod: 50-0.25*121 = 19.75
// ...
logPowerDecibel(128); // -63.55 | index: (50-18.00)/0.25 = 128 | samplePerPeriod: 50-0.25*128 = 18.00
// ...
logPowerDecibel(135); // -14.30 | index: (50-16.25)/0.25 = 135 | samplePerPeriod: 50-0.25*135 = 16.25
logPowerDecibel(136); // -12.64 | index: (50-16.00)/0.25 = 136 | samplePerPeriod: 50-0.25*136 = 16.00 | SINE C
logPowerDecibel(137); // -14.41 | index: (50-15.75)/0.25 = 137 | samplePerPeriod: 50-0.25*137 = 15.75
```

As we can see 

```javascript
function logPhase(index) {
    console.log(
        Math.round(frequencyDomain[index].phase * 360)
    );
}

logPhase(88);  // SINE A
logPhase(120); // SINE B
logPhase(136); // SINE C
```


### Summary

Algorithm described above is maybe not optimal but relatively simple comparing to for example FFT which uses some 
mathematical tricks that are beyond the scope of this article. We can extract major frequencies that builds the 
signal even there is a lot of random noise.

Now you may ask - what can be done with such slow algorithm? The answer is that we can do pretty much especially 
with sound. Frequency of sound waves that humans hear are between 20Hz - 20kHz. To store them properly we need to 
use sampling rate of 44.1kHz. This number of samples per second is relatively low for modern CPUs that executes 
instructions at rate of couple GHz. That allows us to handle audio samples in the real time even with slow algorithm. 
As a source of samples we can just use microphone which almost all devices have. Additionally we don't have to compute 
all frequency bins per each time domain window. We can just assume that our data is carried by some fixed frequency 
and compute only related frequency bin. We just don't need other bins since they are not carrying our data. In case 
of our example (160 bins on frequency domain chart) it will increase the speed 160 times.

Other question may come - why we need to write everything from scratch? There should be plenty of DSP libraries 
that are just ready to use. The answer is *for fun*! :) It's like with car, you can enter it and just drive but 
if you additionally know how it works it's even better. There is one alternative - AnalyserNode from Web Audio API.
It uses FFT under the hood so it's fast. But there is one disadvantage - it doesn't return phase of frequency bin. 
Phase of the wave can be used in data transmission that is more resistant to the noise. Method described in this 
article give us more flexibility, we are not depended to any other code and it's still simple enough to understand. 
We can avoid black box which is doing magic and we have no idea how.

If you are interested in this topic an you want to play with different DFT settings by yourself please visit this 
example hosted on [AudioNetwork](https://audio-network.rypula.pl) project website:

[Discrete Fourier Transform demo](https://audio-network.rypula.pl/example/00-040-dft-carrier-recovery-simple/dft-carrier-recovery-simple.html) 

### TODO:

- [done] CODE add setWidth to chart
- [done] CODE add setMaxSize to queue
- [done] CODE update order of frequency bin
- [done] ARTICLE update order of bins and console.log output
- [done] ARTICLE update order of sine waves
- [done] CODE add form field, frequency bin index to explain under frequency domain chart
- [done] CODE add overlay that shows picked range (frequency bin, window samples)
- [done] CODE add constellation diagram under frequency domain chart and form field
- [done] CODE add last section 'Frequency bin explanation' when we can pick range of samples from window
- [done] CODE add duplicate of processed window chart
- [done] CODE add overlay that shows picked range (on duplicate of processed window chart)
- [done] CODE add info about picked frequency bin
- [done] CODE add ability to add white noise
- [done] CODE add ability to show/hide sections
- [done] CODE add new chart that explains unit vector in a range
+ [done] ARTICLE add info about phase
- ARTICLE write missing examples
- ARTICLE add images and finish everything
- CODE add animation mode

+ [done] much simpler than FFT but ultra slow
+ [done] explain frequency domain and time domain, frequency bin [IMAGE]
+ [done] tell about samplesPerPeriod -> a way to skip sampling frequency
+ [done] add couple of sine waves together [CHART separate and sum]
+ [done] when input signal contains that frequency it will produce lots of vectors that points to the same direction
