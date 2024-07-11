<!-- HistoryChecker.vue -->
<template>
    <div class="comparison-component">
      <button @click="checkForChanges">Check for Changes</button>
      <table v-if="differences.length > 0">
        <thead>
          <tr>
            <th>Campaign Name</th>
            <th>Changes</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="difference in differences" :key="difference.campaign">
            <td>{{ difference.campaign }}</td>
            <td v-html="difference.date + '<br>' + difference.changes"></td>
            <td>Notes</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  
  const differences = ref([]);
  const const2 = {
    "paging": {
        "start": 0,
        "count": 10,
        "links": []
    },
    "metadata": {},
    "elements": [
        {
            "storyDeliveryEnabled": false,
            "targetingCriteria": {
                "include": {
                    "and": [
                        {
                            "or": {
                                "urn:li:adTargetingFacet:interfaceLocales": [
                                    "urn:li:locale:en_US"
                                ]
                            }
                        },
                        {
                            "or": {
                                "urn:li:adTargetingFacet:profileLocations": [
                                    "urn:li:geo:103644278"
                                ]
                            }
                        },
                        {
                            "or": {
                                "urn:li:adTargetingFacet:jobFunctions": [
                                    "urn:li:function:15"
                                ]
                            }
                        },
                        {
                            "or": {
                                "urn:li:adTargetingFacet:skills": [
                                    "urn:li:skill:50260"
                                ]
                            }
                        }
                    ]
                }
            },
            "pacingStrategy": "LIFETIME",
            "locale": {
                "country": "US",
                "language": "en"
            },
            "type": "TEXT_AD",
            "optimizationTargetType": "NONE",
            "runSchedule": {
                "start": 1719536919213
            },
            "changeAuditStamps": {
                "created": {
                    "actor": "urn:li:unknown:0",
                    "time": 1719536664000
                },
                "lastModified": {
                    "actor": "urn:li:unknown:0",
                    "time": 1719536931000
                }
            },
            "costType": "CPC",
            "creativeSelection": "NOT OPIMIZED",
            "offsiteDeliveryEnabled": false,
            "id": 320931536,
            "audienceExpansionEnabled": false,
            "test": false,
            "format": "TEXT_AD",
            "servingStatuses": [
                "RUNNABLE"
            ],
            "version": {
                "versionTag": "4"
            },
            "objectiveType": "WEBSITE_VISIT",
            "associatedEntity": "urn:li:organization:102033074",
            "offsitePreferences": {
                "iabCategories": {
                    "exclude": []
                },
                "publisherRestrictionFiles": {
                    "include": [],
                    "exclude": []
                }
            },
            "campaignGroup": "urn:li:sponsoredCampaignGroup:688364006",
            "dailyBudget": {
                "currencyCode": "USD",
                "amount": "10"
            },
            "unitCost": {
                "currencyCode": "USD",
                "amount": "2"
            },
            "name": "text ad test",
            "account": "urn:li:sponsoredAccount:512388408",
            "status": "ACTIVE"
        },
        {
            "storyDeliveryEnabled": false,
            "targetingCriteria": {
                "include": {
                    "and": [
                        {
                            "or": {
                                "urn:li:adTargetingFacet:interfaceLocales": [
                                    "urn:li:locale:en_US"
                                ]
                            }
                        },
                        {
                            "or": {
                                "urn:li:adTargetingFacet:profileLocations": [
                                    "urn:li:geo:103644278"
                                ]
                            }
                        },
                        {
                            "or": {
                                "urn:li:adTargetingFacet:industries": [
                                    "urn:li:industry:80"
                                ]
                            }
                        },
                        {
                            "or": {
                                "urn:li:adTargetingFacet:skills": [
                                    "urn:li:skill:50260"
                                ]
                            }
                        }
                    ]
                },
                "exclude": {
                    "or": {
                        "urn:li:adTargetingFacet:seniorities": [
                            "urn:li:seniority:8",
                            "urn:li:seniority:3",
                            "urn:li:seniority:9",
                            "urn:li:seniority:2",
                            "urn:li:seniority:1",
                            "urn:li:seniority:7"
                        ]
                    }
                }
            },
            "pacingStrategy": "LIFETIME",
            "locale": {
                "country": "US",
                "language": "en"
            },
            "type": "SPONSORED_UPDATES",
            "optimizationTargetType": "NONE",
            "runSchedule": {
                "start": 1719536285457
            },
            "changeAuditStamps": {
                "created": {
                    "actor": "urn:li:unknown:0",
                    "time": 1719536147000
                },
                "lastModified": {
                    "actor": "urn:li:unknown:0",
                    "time": 1719536938000
                }
            },
            "costType": "CPC",
            "creativeSelection": "OPTIMIZED",
            "offsiteDeliveryEnabled": false,
            "id": 320888526,
            "audienceExpansionEnabled": false,
            "test": false,
            "format": "STANDARD_UPDATE",
            "servingStatuses": [
                "OKRA"
            ],
            "version": {
                "versionTag": "5"
            },
            "objectiveType": "WEBSITE_VISIT",
            "associatedEntity": "urn:li:organization:102033074",
            "offsitePreferences": {
                "iabCategories": {
                    "exclude": []
                },
                "publisherRestrictionFiles": {
                    "include": [],
                    "exclude": []
                }
            },
            "campaignGroup": "urn:li:sponsoredCampaignGroup:688364006",
            "dailyBudget": {
                "currencyCode": "USD",
                "amount": "90"
            },
            "unitCost": {
                "currencyCode": "USD",
                "amount": "1"
            },
            "name": "Test Traffic Campaign 2",
            "account": "urn:li:sponsoredAccount:512388408",
            "status": "ACTIVE"
        },
        {
            "storyDeliveryEnabled": false,
            "targetingCriteria": {
                "include": {
                    "and": [
                        {
                            "or": {
                                "urn:li:adTargetingFacet:interfaceLocales": [
                                    "urn:li:locale:en_US"
                                ]
                            }
                        },
                        {
                            "or": {
                                "urn:li:adTargetingFacet:profileLocations": [
                                    "urn:li:geo:103644278"
                                ]
                            }
                        },
                        {
                            "or": {
                                "urn:li:adTargetingFacet:industries": [
                                    "urn:li:industry:80"
                                ]
                            }
                        },
                        {
                            "or": {
                                "urn:li:adTargetingFacet:skills": [
                                    "urn:li:skill:50260"
                                ]
                            }
                        }
                    ]
                },
                "exclude": {
                    "or": {
                        "urn:li:adTargetingFacet:seniorities": [
                            "urn:li:seniority:8",
                            "urn:li:seniority:3",
                            "urn:li:seniority:9",
                            "urn:li:seniority:2",
                            "urn:li:seniority:1",
                            "urn:li:seniority:7"
                        ]
                    }
                }
            },
            "pacingStrategy": "LIFETIME",
            "locale": {
                "country": "US",
                "language": "en"
            },
            "type": "SPONSORED_UPDATES",
            "optimizationTargetType": "NONE",
            "runSchedule": {
                "start": 1717620363626
            },
            "changeAuditStamps": {
                "created": {
                    "actor": "urn:li:unknown:0",
                    "time": 1717619027000
                },
                "lastModified": {
                    "actor": "urn:li:unknown:0",
                    "time": 1720285908000
                }
            },
            "costType": "CPC",
            "creativeSelection": "OPTIMIZED",
            "offsiteDeliveryEnabled": false,
            "id": 314706446,
            "audienceExpansionEnabled": false,
            "test": false,
            "format": "STANDARD_UPDATE",
            "servingStatuses": [
                "RUNNABLE"
            ],
            "version": {
                "versionTag": "5"
            },
            "objectiveType": "LLLLAMA",
            "associatedEntity": "urn:li:organization:102033074",
            "offsitePreferences": {
                "iabCategories": {
                    "exclude": []
                },
                "publisherRestrictionFiles": {
                    "include": [],
                    "exclude": []
                }
            },
            "campaignGroup": "urn:li:sponsoredCampaignGroup:688364006",
            "dailyBudget": {
                "currencyCode": "USD",
                "amount": "10"
            },
            "unitCost": {
                "currencyCode": "USD",
                "amount": "1"
            },
            "name": "Test Traffic Campaign",
            "account": "urn:li:sponsoredAccount:512388408",
            "status": "OBAMA"
        }
    ]
}
  
  const checkForChanges = async () => {
    differences.value = [];
  
    try {
      const response = await axios.get('/api/linkedin/ad-campaigns');
      const const1 = response.data?.elements || []; // Ensure const1 is an array
  
      const parsedConst2 = const2.elements || []; // Ensure parsedConst2 is an array
  
      const1.forEach((campaign1) => {
        const campaign2 = parsedConst2.find((c) => c.id === campaign1.id);
        if (campaign2) {
          const changes = [];
          Object.keys(campaign1).forEach((key) => {
            if (JSON.stringify(campaign1[key]) !== JSON.stringify(campaign2[key])) {
              changes.push(`${key}: <span class="old-value">${JSON.stringify(campaign1[key])}</span> => <span class="new-value">${JSON.stringify(campaign2[key])}</span>`);
            }
          });
          if (changes.length > 0) {
            differences.value.push({
              campaign: campaign1.name,
              changes: changes.join('<br>'),
              date: new Date().toLocaleDateString()
            });
          }
        }
      });
    } catch (error) {
      console.error('Error fetching const1 from server:', error);
    }
  };
  
  onMounted(() => {
    checkForChanges();
  });
  </script>
  
  <style scoped>
  .comparison-component {
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
  }
  
  button {
    padding: 10px 20px;
    margin-bottom: 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    border: 1px solid #ccc;
    padding: 8px;
    text-align: left;
  }
  
  th {
    background-color: #f2f2f2;
  }
  
  td {
    background-color: #fff;
  }
  </style>