## Tldraw Readme

This repository contains the source code for Tldraw, a collaborative drawing application built
using React, Node.js.

## Getting Started

To run Tldraw locally, please follow the instructions below:

## Prerequisites

Node.js (version 18 or higher)
Docker

## Installation

1.Clone the repository:

### git clone <repository-url>

2.Navigate to the project directory:

### cd tldraw-client

3.Install the dependencies:

### npm install

## Development Mode

To run Tldraw in development mode, use the following command:

### npm run dev

This command will start the development server on [http://localhost:3046].

## Running with Docker

Tldraw can also be run using Docker. To build and run the Docker image, execute the following commands:

### docker build -t tldraw-client .

### docker run -p 83:83 tldraw-client

The application will be accessible at [http://localhost:83].

## License

Tldraw is licensed under the AGPL-3.0 license. See the LICENSE file for more information.
