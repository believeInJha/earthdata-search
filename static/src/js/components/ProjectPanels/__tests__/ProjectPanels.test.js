import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import ProjectPanels from '../ProjectPanels'
import Panels from '../../Panels/Panels'
import PanelSection from '../../Panels/PanelSection'

Enzyme.configure({ adapter: new Adapter() })

const opendapProps = {
  project: {
    byId: {
      collectionId: {
        accessMethods: {
          opendap: {
            variables: {
              variableId1: {
                meta: {},
                umm: {},
                associations: {}
              },
              variableId2: {
                meta: {},
                umm: {},
                associations: {}
              }
            },
            selectedVariables: []
          }
        },
        selectedAccessMethod: 'opendap'
      }
    },
    collectionIds: ['collectionId']
  }
}

function setup(overrideProps) {
  const props = {
    collections: {
      allIds: ['collectionId'],
      byId: {
        collectionId: {
          granules: {},
          metadata: {
            dataset_id: 'test dataset id'
          }
        }
      }
    },
    dataQualitySummaries: {},
    project: {
      byId: {
        collectionId: {
          accessMethods: {
            download: {
              isValid: true,
              type: 'download'
            }
          },
          selectedAccessMethod: 'download'
        }
      },
      collectionIds: ['collectionId']
    },
    panels: {
      activePanel: '0.0.0',
      isOpen: true
    },
    shapefileId: '',
    spatial: {},
    onSelectAccessMethod: jest.fn(),
    onTogglePanels: jest.fn(),
    onSetActivePanel: jest.fn(),
    onUpdateAccessMethod: jest.fn(),
    ...overrideProps
  }

  const enzymeWrapper = shallow(<ProjectPanels {...props} />)

  return {
    enzymeWrapper,
    props
  }
}

describe('ProjectPanels component', () => {
  describe('componentWillReceiveProps', () => {
    test('sets selectedVariables for opendap access method', () => {
      const { enzymeWrapper } = setup(opendapProps)

      enzymeWrapper.setProps({
        project: {
          byId: {
            collectionId: {
              accessMethods: {
                opendap: {
                  selectedVariables: ['variableId1']
                }
              }
            }
          },
          collectionIds: ['collectionId']
        }
      })

      expect(enzymeWrapper.state().selectedVariables).toEqual({
        collectionId: ['variableId1']
      })
    })

    test('does not set selectedVariables for opendap access methods when there are no selected variables', () => {
      const { enzymeWrapper } = setup()

      enzymeWrapper.setProps(opendapProps)

      expect(enzymeWrapper.state().selectedVariables).toEqual({})
    })

    test('does not set selectedVariables for non-opendap access methods', () => {
      const { enzymeWrapper } = setup()

      enzymeWrapper.setProps({})

      expect(enzymeWrapper.state().selectedVariables).toEqual({})
    })
  })

  test('onPanelOpen calls onTogglePanels', () => {
    const { enzymeWrapper, props } = setup()

    enzymeWrapper.instance().onPanelOpen()

    expect(props.onTogglePanels).toHaveBeenCalledTimes(1)
    expect(props.onTogglePanels).toHaveBeenCalledWith(true)
  })

  test('onPanelClose calls onTogglePanels', () => {
    const { enzymeWrapper, props } = setup()

    enzymeWrapper.instance().onPanelClose()

    expect(props.onTogglePanels).toHaveBeenCalledTimes(1)
    expect(props.onTogglePanels).toHaveBeenCalledWith(false)
  })

  test('onChangePanel calls onSetActivePanel', () => {
    const { enzymeWrapper, props } = setup()

    enzymeWrapper.instance().onChangePanel('0.0.1')

    expect(props.onSetActivePanel).toHaveBeenCalledTimes(1)
    expect(props.onSetActivePanel).toHaveBeenCalledWith('0.0.1')
  })

  describe('onCheckboxChange', () => {
    test('check all variables updates the state', () => {
      const { enzymeWrapper } = setup(opendapProps)

      enzymeWrapper.setState({
        variables: {
          variableId1: {
            meta: {},
            umm: {},
            associations: {}
          },
          variableId2: {
            meta: {},
            umm: {},
            associations: {}
          }
        }
      })
      enzymeWrapper.instance().onCheckboxChange({ target: { checked: true } }, 'all', 'collectionId')

      expect(enzymeWrapper.state().selectedVariables).toEqual({
        collectionId: ['variableId1', 'variableId2']
      })
    })

    test('uncheck all variables updates the state', () => {
      const { enzymeWrapper } = setup(opendapProps)

      enzymeWrapper.setState({
        selectedVariables: {
          collectionId: ['variableId1', 'variableId2']
        },
        variables: {
          variableId1: {
            meta: {},
            umm: {},
            associations: {}
          },
          variableId2: {
            meta: {},
            umm: {},
            associations: {}
          }
        }
      })
      enzymeWrapper.instance().onCheckboxChange({ target: { checked: false } }, 'all', 'collectionId')

      expect(enzymeWrapper.state().selectedVariables).toEqual({
        collectionId: []
      })
    })

    test('checking a single variable updates the state', () => {
      const { enzymeWrapper } = setup(opendapProps)

      enzymeWrapper.setState({
        selectedVariable: {
          variableId1: {
            meta: {},
            umm: {},
            associations: {}
          }
        },
        variables: {
          variableId1: {
            meta: {},
            umm: {},
            associations: {}
          },
          variableId2: {
            meta: {},
            umm: {},
            associations: {}
          }
        }
      })
      enzymeWrapper.instance().onCheckboxChange({ target: { checked: true } }, 'variableId1', 'collectionId')

      expect(enzymeWrapper.state().selectedVariables).toEqual({
        collectionId: ['variableId1']
      })
    })

    test('unchecking a single variable updates the state', () => {
      const { enzymeWrapper } = setup(opendapProps)

      enzymeWrapper.setState({
        selectedVariable: {
          variableId1: {
            meta: {},
            umm: {},
            associations: {}
          }
        },
        selectedVariables: {
          collectionId: ['variableId1', 'variableId2']
        },
        variables: {
          variableId1: {
            meta: {},
            umm: {},
            associations: {}
          },
          variableId2: {
            meta: {},
            umm: {},
            associations: {}
          }
        }
      })
      enzymeWrapper.instance().onCheckboxChange({ target: { checked: false } }, 'variableId1', 'collectionId')

      expect(enzymeWrapper.state().selectedVariables).toEqual({
        collectionId: ['variableId2']
      })
    })
  })

  test('onSaveVariables calls onUpdateAccessMethod and onChangePanel', () => {
    const { enzymeWrapper, props } = setup(opendapProps)

    enzymeWrapper.instance().onSaveVariables('collectionId', 1)

    expect(props.onUpdateAccessMethod).toHaveBeenCalledTimes(1)
    expect(props.onUpdateAccessMethod).toHaveBeenCalledWith({
      collectionId: 'collectionId',
      method: {
        opendap: {
          selectedVariables: undefined,
          variables: {
            variableId1: {
              associations: {},
              meta: {},
              umm: {}
            },
            variableId2: {
              associations: {},
              meta: {},
              umm: {}
            }
          }
        }
      }
    })

    expect(props.onSetActivePanel).toHaveBeenCalledTimes(1)
    expect(props.onSetActivePanel).toHaveBeenCalledWith('0.1.1')
  })

  test('onViewDetails sets the state and calls onChangePanel', () => {
    const { enzymeWrapper, props } = setup(opendapProps)

    enzymeWrapper.instance().onViewDetails({
      meta: {},
      umm: {},
      associations: {}
    }, 1)

    expect(enzymeWrapper.state().selectedVariable).toEqual({
      meta: {},
      umm: {},
      associations: {}
    })

    expect(props.onSetActivePanel).toHaveBeenCalledTimes(1)
    expect(props.onSetActivePanel).toHaveBeenCalledWith('0.1.3')
  })

  test('backToOptions sets the state', () => {
    const { enzymeWrapper } = setup(opendapProps)

    enzymeWrapper.setState({
      selectedKeyword: 'test keyword',
      variables: {
        variableId1: {
          meta: {},
          umm: {},
          associations: {}
        }
      }
    })

    enzymeWrapper.instance().backToOptions()

    expect(enzymeWrapper.state().selectedKeyword).toEqual(null)
    expect(enzymeWrapper.state().variables).toEqual(null)
  })

  test('selectKeyword sets the state and calls onChangePanel', () => {
    const { enzymeWrapper, props } = setup(opendapProps)

    enzymeWrapper.instance().selectKeyword('test keyword', {
      variableId1: {
        meta: {},
        umm: {},
        associations: {}
      }
    }, 0)

    expect(enzymeWrapper.state().selectedKeyword).toEqual('test keyword')
    expect(enzymeWrapper.state().variables).toEqual({
      variableId1: {
        meta: {},
        umm: {},
        associations: {}
      }
    })

    expect(props.onSetActivePanel).toHaveBeenCalledTimes(1)
    expect(props.onSetActivePanel).toHaveBeenCalledWith('0.0.2')
  })

  test('clearSelectedKeyword sets the state and calls onChangePanel', () => {
    const { enzymeWrapper, props } = setup(opendapProps)

    enzymeWrapper.setState({
      selectedKeyword: 'test keyword',
      variables: {
        variableId1: {
          meta: {},
          umm: {},
          associations: {}
        }
      }
    })

    enzymeWrapper.instance().clearSelectedKeyword('0.0.1')

    expect(enzymeWrapper.state().selectedKeyword).toEqual(null)
    expect(enzymeWrapper.state().variables).toEqual(null)

    expect(props.onSetActivePanel).toHaveBeenCalledTimes(1)
    expect(props.onSetActivePanel).toHaveBeenCalledWith('0.0.1')
  })

  test('clearSelectedVariable sets the state and calls onChangePanel', () => {
    const { enzymeWrapper, props } = setup(opendapProps)

    enzymeWrapper.setState({
      selectedVariable: {
        meta: {},
        umm: {},
        associations: {}
      }
    })

    enzymeWrapper.instance().clearSelectedVariable('0.0.2')

    expect(enzymeWrapper.state().selectedVariable).toEqual(null)

    expect(props.onSetActivePanel).toHaveBeenCalledTimes(1)
    expect(props.onSetActivePanel).toHaveBeenCalledWith('0.0.2')
  })

  test('resetForm calls onUpdateAccessMethod', () => {
    const { enzymeWrapper, props } = setup({
      project: {
        byId: {
          collectionId: {
            accessMethods: {
              esi0: {
                model: 'mock model',
                rawModel: 'mock rawModel'
              }
            },
            selectedAccessMethod: 'esi0'
          }
        },
        collectionIds: ['collectionId']
      }
    })

    enzymeWrapper.instance().resetForm('collectionId', 'esi0')

    expect(props.onUpdateAccessMethod).toHaveBeenCalledTimes(1)
    expect(props.onUpdateAccessMethod).toHaveBeenCalledWith({
      collectionId: 'collectionId',
      method: {
        esi0: {
          model: undefined,
          rawModel: undefined
        }
      }
    })
  })
})
