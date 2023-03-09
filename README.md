# <name>
## Installation
1. Download the desired release version at github.
1. Unpack the download file.
1. Install npm packages.
    ```
    npm install
    ```
1. Create config file and make changes if needed.
    ```
    cp config.template.json config.json
    ```
1. Build executable files.
    ```
    npm start build
    ```
1. Setup the system service
    ```
    sudo cp <name>.service /etc/systemd/system/
    sudo systemctl enable <name>.service
    sudo systemctl start <name>.service
    ```