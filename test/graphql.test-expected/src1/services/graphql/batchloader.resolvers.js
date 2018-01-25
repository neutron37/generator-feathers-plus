
/* eslint-disable no-unused-vars */
// Define GraphQL resolvers using Feathers services and BatchLoaders. (Can be re-generated.)
const { getByDot, setByDot } = require('feathers-hooks-common');
//!code: imports //!end
//!code: init //!end

let moduleExports = function batchLoaderResolvers(app, options) {
  let { convertArgsToParams, convertArgsToFeathers, extractAllItems, extractFirstItem, // eslint-disable-line
    feathersBatchLoader: { feathersBatchLoader } } = options;

  //!<DEFAULT> code: services
  let nedb1 = app.service('/nedb-1');
  let nedb2 = app.service('/nedb-2');
  //!end

  //!<DEFAULT> code: get-result
  // Given a fieldName in the parent record, return the result from a BatchLoader
  // The result will be an object, an array of objects, or null.
  function getResult(batchLoaderName, fieldName) {
    const contentByDot = `batchLoaders.${batchLoaderName}`;

    // `content.app = app` is the Feathers app object.
    // `content.batchLoaders = {}` is where the BatchLoaders for a request are stored.
    return (parent, args, content, ast) => {
      let batchLoader = getByDot(content, contentByDot);

      if (!batchLoader) {
        batchLoader = getBatchLoader(batchLoaderName, parent, args, content, ast);
        setByDot(content, contentByDot, batchLoader);
      }

      return batchLoader.load(parent[fieldName]);
    };
  }
  //!end

  // A transient BatchLoader can be created only when (one of) its resolver has been called,
  // as the BatchLoader loading function may require data from the 'args' passed to the resolver.
  // Note that each resolver's 'args' are static throughout a GraphQL call.
  function getBatchLoader(dataLoaderName, parent, args, content, ast) {
    let feathersParams;

    switch (dataLoaderName) {
    /* Persistent BatchLoaders. Stored in `content.batchLoaders._persisted`. */
    //!<DEFAULT> code: bl-persisted
    // case '_persisted.user.one.id': // service user, returns one object, key is field id
    //!end

    /* Transient BatchLoaders shared among resolvers. Stored in `content.batchLoaders._shared`. */
    //!<DEFAULT> code: bl-shared
    // *.*: User
    // case '_shared.user.one.id': // service user, returns one object, key is field id
    //!end

    /* Transient BatchLoaders used by only one resolver. Stored in `content.batchLoaders`. */

    // Nedb1.nedb2: Nedb2!
    //!<DEFAULT> code: bl-Nedb1-nedb2
    case 'Nedb1.nedb2':
      return feathersBatchLoader(dataLoaderName, '!', '_id',
        keys => {
          feathersParams = convertArgsToFeathers(args,
            { query: { _id: { $in: keys }, $sort: undefined }, populate: false }
          );
          return nedb2.find(feathersParams);
        }
      );
    //!end

    // Nedb2.nedb1: Nedb1!
    //!<DEFAULT> code: bl-Nedb2-nedb1
    case 'Nedb2.nedb1':
      return feathersBatchLoader(dataLoaderName, '!', '_id',
        keys => {
          feathersParams = convertArgsToFeathers(args,
            { query: { _id: { $in: keys }, $sort: undefined }, populate: false }
          );
          return nedb1.find(feathersParams);
        }
      );
    //!end

    /* Throw on unknown BatchLoader name. */
    default:
      //!<DEFAULT> code: bl-default
      throw new Error(`GraphQL query requires BatchLoader named '${dataLoaderName}' but no definition exists for it.`);
      //!end
    }
  }

  let returns = {

    Nedb1: {

      // nedb2: Nedb2!
      //!<DEFAULT> code: resolver-Nedb1-nedb2
      nedb2: getResult('Nedb1.nedb2', 'nedb2Id'),
      //!end
    },

    Nedb2: {

      // nedb1: Nedb1!
      //!<DEFAULT> code: resolver-Nedb2-nedb1
      nedb1: getResult('Nedb2.nedb1', 'nedb1Id'),
      //!end
    },

    //!code: resolver_field_more //!end

    Query: {

      //!<DEFAULT> code: query-Nedb1
      // getNedb1(query: JSON, params: JSON, key: JSON): Nedb1
      getNedb1 (parent, args, content, info) {
        const feathersParams = convertArgsToFeathers(args);
        return nedb1.get(args.key, feathersParams).then(extractFirstItem);
      },

      // findNedb1(query: JSON, params: JSON): [Nedb1!]
      findNedb1(parent, args, content, info) {
        const feathersParams = convertArgsToFeathers(args, { query: { $sort: {   _id: 1 } } });
        return nedb1.find(feathersParams).then(extractAllItems);
      },
      //!end

      //!<DEFAULT> code: query-Nedb2
      // getNedb2(query: JSON, params: JSON, key: JSON): Nedb2
      getNedb2 (parent, args, content, info) {
        const feathersParams = convertArgsToFeathers(args);
        return nedb2.get(args.key, feathersParams).then(extractFirstItem);
      },

      // findNedb2(query: JSON, params: JSON): [Nedb2!]
      findNedb2(parent, args, content, info) {
        const feathersParams = convertArgsToFeathers(args, { query: { $sort: {   _id: 1 } } });
        return nedb2.find(feathersParams).then(extractAllItems);
      },
      //!end
      //!code: resolver_query_more //!end
    },
  };

  //!code: func_return //!end
  return returns;
};

//!code: more //!end

//!code: exports //!end
module.exports = moduleExports;

//!code: funcs //!end
//!code: end //!end