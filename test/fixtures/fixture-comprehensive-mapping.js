module.exports = {
   "_id":"564b5883e2dd1f64452a1670",
   "type":"object",
   "__v":0,
   "element":{
      "mixed":false,
      "fields":[

      ]
   },
   "fields":[
      {
         "type":"array",
         "from":"arrayOfStrings",
         "_id":"564b5883e2dd1f64452a167d",
         "transformation" : "customStringConcat",
         "element":{
            "mixed":false,
            "fields":[

            ]
         },
         "fields":[

         ],
         "use":true
      },
      {
         "type":"array",
         "from":"arrayOfNumbers",
         "_id":"564b5883e2dd1f64452a167c",
         "transformation":"sum",
         "element":{
            "mixed":false,
            "fields":[

            ]
         },
         "fields":[

         ],
         "use":true
      },
      {
         "type":"array",
         "from":"mixedArray",
         "transformation" : "customMixedArrayTransform",
         "_id":"564b5883e2dd1f64452a167b",
         "element":{
            "mixed":true,
            "fields":[

            ]
         },
         "fields":[

         ],
         "use":true
      },
      {
         "type":"array",
         "from":"arrayOfArrays",
         "_id":"564b5883e2dd1f64452a167a",
         "element":{
            "type":"array",
            "mixed" : false,
            "fields":[],
            "element" : {
              "type":"number",
              "mixed" : false,
              "transformation" : "sum",
              "fields":[]
            }
         },
         "fields":[

         ],
         "use":true
      },
      {
         "type":"string",
         "from":"string",
         "_id":"564b5883e2dd1f64452a1679",
         "to":"ding",
         "transformation":"capitalize",
         "element":{
            "mixed":false,
            "fields":[

            ]
         },
         "fields":[

         ],
         "use":true
      },
      {
         "type":"boolean",
         "from":"bool",
         "_id":"564b5883e2dd1f64452a1678",
         "transformation":"invert",
         "element":{
            "mixed":false,
            "fields":[

            ]
         },
         "fields":[

         ],
         "use":true
      },
      {
         "type":"number",
         "from":"number",
         "_id":"564b5883e2dd1f64452a1677",
         "transformation":"round",
         "element":{
            "mixed":false,
            "fields":[

            ]
         },
         "fields":[

         ],
         "use":true
      },
      {
         "type":"object",
         "from":"object",
         "_id":"564b5883e2dd1f64452a1671",
         "element":{
            "mixed":false,
            "fields":[

            ]
         },
         "fields":[
            {
               "type":"number",
               "from":"numProp",
               "_id":"564b5883e2dd1f64452a1676",
               "to":"numPropRenamed",
               "transformation":"round",
               "element":{
                  "mixed":false,
                  "fields":[

                  ]
               },
               "fields":[

               ],
               "use":true
            },
            {
               "type":"boolean",
               "from":"boolProp",
               "_id":"564b5883e2dd1f64452a1675",
               "transformation":"invert",
               "element":{
                  "mixed":false,
                  "fields":[

                  ]
               },
               "fields":[

               ],
               "use":true
            },
            {
               "type":"object",
               "from":"subObjectProp",
               "_id":"564b5883e2dd1f64452a1673",
               "element":{
                  "mixed":false,
                  "fields":[

                  ]
               },
               "fields":[
                  {
                     "type":"boolean",
                     "from":"a",
                     "_id":"564b5883e2dd1f64452a1674",
                     "to":"b",
                     "transformation":"invert",
                     "element":{
                        "mixed":false,
                        "fields":[

                        ]
                     },
                     "fields":[

                     ],
                     "use":true
                  }
               ],
               "use":true
            },
            {
               "type":"object",
               "from":"emptyObjectProp",
               "_id":"564b5883e2dd1f64452a1672",
               "to":"emptyObjectProperty",
               "element":{
                  "mixed":false,
                  "fields":[

                  ]
               },
               "fields":[

               ],
               "use":true
            }
         ],
         "use":true
      }
   ],
   "use":true
};
