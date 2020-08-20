FROM python:3-slim

RUN pip install scipy
RUN pip install numpy
RUN pip install pywavelets
RUN pip install matplotlib

ADD bpm_detection.py /

CMD cat - > audio.wav && python bpm_detection.py --filename audio.wav