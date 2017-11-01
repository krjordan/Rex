#!/usr/bin/env node
const path = require('path')
const puppeteer = require('puppeteer')
const superstatic = require('superstatic').server
const shell = require('shelljs')
const caporal = require('caporal')
const fs = require('fs')
const _ = require('lodash')

let routes = []
let config

caporal
  .version('0.0.1')
  .description('Prerender your single page app')
  .argument('[directory]', 'Directory your site lives in')
  .option('--routes', 'List of routes to prerender', caporal.LIST)
  .action(async function(args, options, logger) {
    serve(args.directory)

    // Check for rex.config.js file
    if(fs.existsSync(path.join(process.cwd(), 'rex.config.js'))) {
      const configFile = require(path.join(process.cwd(), 'rex.config.js'))
      const configObject = configFile()
      config = Object.assign({}, options, configObject)
    }

    config = _.mergeWith(config, options, args, mergeArrayValues)

    // If flags were passed
    if(config.routes) {
      const staticFiles = config.routes.map(async (route) => {
        const result = await go(config, route)
        return await saveFile(config.directory, route, result)
      })

      await waitForStaticFiles(staticFiles)
      process.exit()

    } else {
      const result = await go(config)
      await saveFile(config.directory, '/', result)
      process.exit()
    }
  })

caporal.parse(process.argv)

function serve(directory) {
  const app = superstatic({
    port: 3000,
    config: {
      public: directory || 'dist',
      rewrites: [ 
	{ source: '**', destination: '/index.html' }
      ]
    }
  })

  app.listen()
}


async function go(opts, route = '') {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto('http://localhost:3000'+route)
  
  const contents = await page.evaluate(() => document.documentElement.outerHTML)

  await browser.close()
  return contents
}


async function saveFile(directory, route = '', contents) {
  return new Promise((res, rej) => {
  
    if(route != '/') {
      shell.mkdir('-p', path.join(process.cwd() + '/' + directory + route));
    }

    fs.writeFile(path.join(process.cwd() + '/' + directory + route, 'index.html'), contents, 'utf-8', (err) => {
      if(err) rej(err)
      res()
    })

  })
}


async function waitForStaticFiles(staticFiles) {
  return Promise.all(staticFiles)
    // .then(process.exit)
}

function mergeArrayValues(objValue, srcValue) {
  if (_.isArray(objValue)) {
      return objValue.concat(srcValue);
    }
}
