const fs = require('fs');
const xml2js = require('xml2js');
const parseString = xml2js.parseString;
const _ = require('lodash');

const bundleId = process.argv[2];
const platform = process.argv[3];
const clientId = process.argv[4];
let appNames = [];

for (let i = 5; i < process.argv.length; i++) {
  appNames.push(process.argv[i]);
}

const appName = appNames.join(' ');

configXml = fs.readFileSync('config.xml').toString();

checkGoogleServiceInfo();

parseString(configXml, (err, result) => {
  result.widget.$.id = bundleId;
  result.widget.name = appName;
  result.widget.description = appName;

  const customurlscheme = _.find(result.widget.plugin, (plugin) => {
    return plugin.$.name === 'cordova-plugin-customurlscheme'
  })

  if (!customurlscheme) {
    console.log('cordova-plugin-customurlscheme을 찾을 수 없습니다.');
    process.exit(1);
  }

  customurlscheme.variable[0].$.value = `appzet-${clientId}`;

  result.widget.chcp[0]['config-file'][0].$.url = result.widget.chcp[0]['config-file'][0].$.url.replace(/\/[0-9]+\//, `/${clientId}/`);

  const builder = new xml2js.Builder();
  var xml = builder.buildObject(result);
  fs.writeFile('config.xml', xml);
})

function checkGoogleServiceInfo() {
  let serviceText = fs.readFileSync('google-services.json').toString();
  let servicePlistText = fs.readFileSync('GoogleService-Info.plist').toString();

  switch (platform) {
    case 'all':
      if (serviceText.indexOf(`${bundleId}`) < 0) {
        console.log('google-services.json is wrong file');
        process.exit(1);
      }

      if (servicePlistText.indexOf(`${bundleId}`) < 0) {
        console.log('google-services.plist yis wrong file');
        process.exit(1);
      }
      break;
    case 'android':
      if (serviceText.indexOf(`${bundleId}`) < 0) {
        console.log('google-services.json is wrong file');
        process.exit(1);
      }
      break;
    case 'ios':
      if (servicePlistText.indexOf(`${bundleId}`) < 0) {
        console.log('google-services.plist yis wrong file');
        process.exit(1);
      }
      break;
    default:
      console.log('올바른 플랫폼을 입력해주세요.');
      process.exit(1);
  }

}