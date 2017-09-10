#!/bin/bash
APTY=$1
APTGET="apt-get $APTY"
echo -e "RASPI\t: Making room..."
sudo APTGET purge wolfram-engine

echo -e "RASPI\t: upgrading Raspbian operating system"
sudo apt update
sudo apt upgrade

echo -e "OPENCV\t: Installing OpenCV3"
echo -e "OPENCV\t: per http://www.pyimagesearch.com/2016/04/18/install-guide-raspberry-pi-3-raspbian-jessie-opencv-3/"

echo -e "OPENCV\t: Installing OpenCV3 dependencies..."
sudo APTGET install build-essential git cmake pkg-config
sudo APTGET install libjpeg-dev libtiff5-dev libjasper-dev libpng12-dev
sudo APTGET install libavcodec-dev libavformat-dev libswscale-dev libv4l-dev
sudo APTGET install libxvidcore-dev libx264-dev
sudo APTGET install libgtk2.0-dev
sudo APTGET install libatlas-base-dev gfortran

echo -e "OPENCV\t: Installing Python..."
sudo APTGET install python2.7-dev python3-dev
wget https://bootstrap.pypa.io/get-pip.py
sudo python get-pip.py
sudo pip install virtualenv virtualenvwrapper
sudo rm -rf ~/.cache/pip
grep WORKON_HOME ~/.profile
RC=$?
if [ "$RC" != "0" ]; then
    echo "updating ~/.profile..."
    echo '' >> ~/.profile
    echo '# virtualenv and virtualenvwrapper' >> ~/.profile
    echo 'export WORKON_HOME=$HOME/.virtualenvs' >> ~/.profile
    echo 'source /usr/local/bin/virtualenvwrapper.sh' >> ~/.profile
fi
source ~/.profile
mkvirtualenv cv -p python3
pip install numpy

echo -e "OPENCV\t: Download OpenCV3 source code..."
wget -O opencv.zip https://github.com/Itseez/opencv/archive/3.1.0.zip
unzip opencv.zip
wget -O opencv_contrib.zip https://github.com/Itseez/opencv_contrib/archive/3.1.0.zip
unzip opencv_contrib.zip

echo -e "OPENCV\t: Building OpenCV 3.1.0"
CV_CONTRIB="`pwd`/opencv_contrib-3.1.0"
cd opencv-3.1.0/
mkdir -p build
cd build
cmake -D CMAKE_BUILD_TYPE=RELEASE \
    -D CMAKE_INSTALL_PREFIX=/usr/local \
    -D INSTALL_PYTHON_EXAMPLES=ON \
    -D ENABLE_PRECOMPILED_HEADERS=OFF \
    -D OPENCV_EXTRA_MODULES_PATH=../../opencv_contrib-3.1.0/modules \
    -D BUILD_EXAMPLES=ON \
    .. 2>&1 | tee cmake.log
    
make -j4

