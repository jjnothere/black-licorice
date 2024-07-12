<template>
    <div class="comparison-component">
      <button @click="checkForChanges">Check for Changes</button>
      <table v-if="differences.length > 0">
        <thead>
          <tr>
            <th>Campaign Name</th>
            <th>Date</th>
            <th>Changes</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="difference in reversedDifferences" :key="difference._id">
            <td>{{ difference.campaign }}</td>
            <td>{{ difference.date }}</td>
            <td v-html="difference.changes"></td>
            <td>
              <input v-model="difference.newNote" placeholder="Add a new note" />
              <button @click="addNotePrompt(difference._id)">Add Note</button>
              <ul>
                <li v-for="(note, noteIndex) in difference.notes.slice().reverse()" :key="noteIndex">
                  <span v-if="!note.isEditing">{{ note.note }} ({{ note.timestamp }})</span>
                  <input
                    v-if="note.isEditing"
                    v-model="note.newNote"
                    @keyup.enter="saveNotePrompt(difference._id, noteIndex)"
                    @blur="saveNotePrompt(difference._id, noteIndex)"
                  />
                  <button v-if="!note.isEditing" @click="enableEditMode(difference._id, noteIndex)">Edit</button>
                  <button v-if="note.isEditing" @click="saveNotePrompt(difference._id, noteIndex)">Save</button>
                  <button @click="deleteNotePrompt(difference._id, noteIndex)">Delete</button>
                </li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
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
                "amount": "1"
            },
            "name": "Test Traffic Campaign",
            "account": "urn:li:sponsoredAccount:512388408",
            "status": "OBAMA"
        }
    ]
}
  
  const reversedDifferences = computed(() => {
    return differences.value.slice().reverse();
  });
  
  const fetchCurrentCampaigns = async () => {
    try {
      const response = await axios.get('/api/get-current-campaigns');
      return response.data?.elements || [];
    } catch (error) {
      console.error('Error fetching current campaigns from database:', error);
      return [];
    }
  };
  
  const fetchAllChanges = async () => {
    try {
      const response = await axios.get('/api/get-all-changes');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching all changes from database:', error);
      return [];
    }
  };
  
  const saveCampaigns = async () => {
    try {
      await axios.post('/api/save-campaigns', { campaigns: const2 });
      console.log('Campaigns saved successfully');
    } catch (error) {
      console.error('Error saving campaigns:', error);
    }
  };
  
  const checkForChanges = async () => {
    const currentCampaigns = await fetchCurrentCampaigns();
    const parsedConst2 = const2.elements || [];
  
    parsedConst2.forEach((campaign2) => {
      const campaign1 = currentCampaigns.find((c) => c.id === campaign2.id);
      if (campaign1) {
        const changes = [];
        Object.keys(campaign1).forEach((key) => {
          if (JSON.stringify(campaign1[key]) !== JSON.stringify(campaign2[key])) {
            changes.push(`${key}: <span class="old-value">${JSON.stringify(campaign1[key])}</span> => <span class="new-value">${JSON.stringify(campaign2[key])}</span>`);
          }
        });
        if (changes.length > 0) {
          differences.value.push({
            campaign: campaign2.name,
            date: new Date().toLocaleDateString(),
            changes: changes.join('<br>'),
            notes: campaign2.notes || [],
          });
        }
      } else {
        differences.value.push({
          campaign: campaign2.name,
          date: new Date().toLocaleDateString(),
          changes: `New campaign added: ${JSON.stringify(campaign2)}`,
          notes: campaign2.notes || [],
        });
      }
    });
  
    // Save new changes to the database
    if (differences.value.length > 0) {
      try {
        await axios.post('/api/save-changes', { changes: differences.value });
        console.log('New changes saved successfully');
      } catch (error) {
        console.error('Error saving new changes:', error);
      }
    }
  
    // Save campaigns to the database
    await saveCampaigns();
  
    // Fetch all changes from the database
    const allChanges = await fetchAllChanges();
    differences.value = allChanges;
  };
  
  const addNotePrompt = async (id) => {
    const difference = differences.value.find(diff => diff._id === id);
    if (!difference.newNote) return;
    try {
      await axios.post('/api/update-notes', { id, newNote: difference.newNote });
      difference.notes.push({ note: difference.newNote, timestamp: new Date().toISOString() });
      difference.newNote = ''; // Clear input
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };
  
  const enableEditMode = (id, noteIndex) => {
    const difference = differences.value.find(diff => diff._id === id);
    const note = difference.notes[noteIndex];
    note.isEditing = true;
    note.newNote = note.note;
  };
  
  const saveNotePrompt = async (id, noteIndex) => {
    const difference = differences.value.find(diff => diff._id === id);
    const note = difference.notes[noteIndex];
    if (note.newNote === note.note) {
      note.isEditing = false;
      return;
    }
    try {
      await axios.post('/api/edit-note', { id, noteIndex, updatedNote: note.newNote });
      note.note = note.newNote;
      note.timestamp = new Date().toISOString();
      note.isEditing = false;
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };
  
  const deleteNotePrompt = async (id, noteIndex) => {
    try {
      await axios.post('/api/delete-note', { id, noteIndex });
      const difference = differences.value.find(diff => diff._id === id);
      difference.notes.splice(noteIndex, 1);
    } catch (error) {
      console.error('Error deleting note:', error);
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