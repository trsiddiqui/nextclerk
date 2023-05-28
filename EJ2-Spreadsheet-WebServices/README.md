# EJ2-Spreadsheet-WebServices
EJ2 Spreadsheet component web services

OPEN TERMINAL INSIDE WebAPI

Docker Setup

// Make image
docker build --progress=plain --no-cache -t trsiddiqui1989/ej2-spreadsheet-web-services -f Dockerfile .

// Login
docker login
// username: trsiddiqui1989
// password: 21081989

// Docker Push Image
docker push trsiddiqui1989/ej2-spreadsheet-web-services

// Start container with image
docker run -p 80:80/tcp -it --rm trsiddiqui1989/ej2-spreadsheet-web-services
