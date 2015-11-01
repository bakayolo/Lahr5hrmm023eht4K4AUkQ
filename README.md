# Configuration

You can change 'config.js' to change the workers configuration.
Mainly the mongodb host and the beanstalk host.

# Initialization

Run the script 'init.js' to initialize the 'rates' collection.
The script will drop the collection and will create index.

# Producer worker

Run the script 'producer_worker.js' without parameter to see the worker usage.

# Consumer worker

Run the script 'consumer_worker.js' to start to process job from beanstalk.
The script doest not take any parameter.