const createClient = require('../modules/twitter-client');
const numeral = require('numeral');

const getHome = (req, res) => {
  let sessionData = req.session;

  //create object twitterClient
  let twitterClient = createClient(
    sessionData.consumerKey,
    sessionData.consumerSecret,
    sessionData.accessToken,
    sessionData.accessSecret
  );

  twitterClient.get(
    'account/verify_credentials',
    {
      skip_status: true,
    },
    (err, data, response) => {
      if (err) {
        console.log(err);
      } else {
        let menfess = {
          name: data.name,
          followers: numeral(data.followers_count).format('0.0a'),
          following: data.friends_count,
          img_url: data.profile_image_url.replace('_normal', ''),
        };
        res.render('home', {
          menfess,
          authenticated: true,
        });
      }
    }
  );
};

module.exports = getHome;
