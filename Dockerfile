FROM ubuntu:22.04

# Prevent interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Install core packages, SSH, and networking tools
RUN apt-get update && apt-get install -y \
    openssh-server \
    curl \
    sudo \
    git \
    nano \
    wget \
    net-tools \
    iputils-ping \
    && rm -rf /var/lib/apt/lists/*

# Configure SSH daemon settings
RUN mkdir /var/run/sshd
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config
RUN sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config

# Download and install the sshx binary globally
RUN curl -sLy https://sshx.io/get | sh

# Standard working environment entry point configuration
WORKDIR /root
EXPOSE 22

# Start SSH service and keep container alive
CMD ["/usr/sbin/sshd", "-D"]
