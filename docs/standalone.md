# Standalone mode

Standalone mode means that you will be running this app in a docker container without myopenhab acting as middle man.  
  
This conainer will be reachable from the outside world and so you know the risks associated with that.  
  
SSL encryption that google requires is provided by let's encrypt  
  
This can only handle single opnehab instance  

## **REQUIREMENTS**

* a static ip address that is accessible from the internet on ports 80 and 443 (dynamic would probably also do). No NAT, firewalls, etc.
* a linux box that runs your openhab instance, or that can be access from this box without any authentication
* a domain or subdomain. You can get one for free for example from https://freedns.afraid.org/ (just google it)

There are other options - like running this on some cheap hosting machine, and accessing local openhab instance via some vpn linking, etc (if you don't have a static ip address)

Insructions here are written for x64 debian stretch

## Setup

### Install docker 
```
sudo apt-get update

sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg2 \
    software-properties-common -y

curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -
// this command varies if you use arm (e.g. raspberry pi, check docker toks for correct arch value)
sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/debian \
   $(lsb_release -cs) \
   stable"

sudo apt-get update && sudo apt-get install docker-ce docker-ce-cli containerd.io -y
```

### Prepare configuration
  - get your domain or subdomain
  - point it out to your ip address (you can look it up from command line via `curl ipecho.net/plain`)
  - create a clientId and clientSecret that you will use in google auth. Set them to some truly random strings. You have been warned

### Run docker image

Substitute configuration values with appropriate params

Option | Description
------------ | -------------
DOMAIN | your domain or subdomain
EMAIL | email for let's encrypt service (usually notifies you if certificate is expiring)
STANDALONE | means that the app will be running in standalone mode
STANDALONE_CLIENT_ID | clientId for oauth flow. Set to something truly random
STANDALONE_CLIENT_SECRET | clientSecret for oauth flow. Set to something truly random
OPENHAB_URL | your unprotected openhab url that is reachable from this machine running this docker instance.
/home/yourusername/certs | path where let's ecnrypt will store it's certs

Let's encrypt will store certificates in /home/yourusername/certs dir, so that if you restart docked, it would not have to request new ones (there is an API call limit). Make sure you set that path to something that actually exists

**Your are running docker as sudo. You know what that means**

```
sudo docker run \
      -v /home/yourusername/certs:/etc/letsencrypt \
      -e DOMAIN=your-domain-name \
      -e EMAIL=youremail-for-letsencrypt@example.org \
      -e STANDALONE=true \
      -e STANDALONE_CLIENT_ID=change-this-id-for-your-own-security \
      -e STANDALONE_CLIENT_SECRET=change-this-secret-for-your-own-security \
      -e OPENHAB_URL=http://your-openhab-host-reachable-from-this-machine:8080 \
      -p 80:80 -p 443:443 \
      -d gytisgreitai/openhab-ga-unofficial-demo:latest
```

Next try opening your given domain name in the browser. If you see `OK` string. All good.
  
Sometimes let's encrypt fails due to server overload issues. If you are sure that your domain DNS is correctly setup, and you see ssl warning while accessing it, try restarting docker container.
  

### Create Actions project

- Go to [Google Actions Console](https://console.actions.google.com)
- Click New Project, enter project name (this is how it will be visible in Google Home App), e.g `OpenHAB Home Automation`
- Select `Smart Home` from options, click `Smart home` again
- Set name for your smarthome action,  e.g. `OpenHAB Home Automation`
- On the left click on `Actions`. In fulfillment url enter `https://your-domain-name/smarthome`, click save
- On the left click on `Account Linking`, select `No, I only want to allow account creation on my website` and click next
- Select `OAuth` as linking type and `Authorization code` as grant type, click Next
- Enter client id and client secret that you used to launch docker image. `Authorization URL` should be se to `https://your-domain-name/standalone-auth/authorize` and Token URL to `https://your-domain-name/standalone-auth/token` Click Next
- In Configure your client click Next
- In Testing instructions just enter any random data, you are not actually submitting account for testing

### Deploy your actions project

For this you need:
- [gactions cli](https://developers.google.com/actions/tools/gactions-cli)
- project-id (look it up in Google action console from browser url, it will be something like `openhab-home-automation-1234asd` if you named it OpenHAB Home Automation)

```
curl -o gactions https://dl.google.com/gactions/updates/bin/linux/amd64/gactions/gactions && chmod +x gactions

curl -o action.json https://raw.githubusercontent.com/gytisgreitai/openhab-google-home/master/action.json

DOMAIN=https://your-domain-name && (sed -e "s|DOMAIN|$DOMAIN|g" action.json > action.json.tmp && mv action.json.tmp action.json)

./gactions test --action_package action.json --project project-id
```

### Link on your mobile phone

- Open Google Home
- Click Add -> Set up device -> Works with google
- In the list you should see your device named with `[test]` prefix, something like `[test] OpenHAB Home Automation`
- Click on it. You will be redirected to auth screen. If it just returns to the app, click it again (this is a bit of a non standard oauth, so sometimes you have to click twice). You must see `Login In` loader spinning
- If All is ok, you should see your devices from OpenHAB
