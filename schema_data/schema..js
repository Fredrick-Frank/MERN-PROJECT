//destructing the file
//const { projects, clients} = require('../server/sampleData')

//Calling in our models schema
const Project = require('../server/models/Project');
const Client = require('../server/models/Client');

const  { GraphQLObjectType,
 GraphQLID, 
 GraphQLString, 
 GraphQLSchema, 
 GraphQLList,
 GraphQLNonNull,
 GraphQLEnumType} = require('graphql');

//Project Type
const ProjectType = new GraphQLObjectType({
  name: 'Project',
  fields: () => ({
    id: {type: GraphQLID },
    name: {type: GraphQLString },
    description:{ type: GraphQLString},
    status: {type: GraphQLString},
    client: { //creating a relationship btw different resources (data: the project as a parent and client as a child)
      type: ClientType,
      resolve(parent, args){
        return Client.findById(parent.clientId);
      },
    },
  }),
});

//Client Type
const ClientType = new GraphQLObjectType({
  name: 'Client',
  fields: () => ({
    id: {type: GraphQLID },
    name: {type: GraphQLString },
    email:{ type: GraphQLString},
    phone: {type: GraphQLString}
  })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    projects:{ //Getting the entire clients data 
       type: new GraphQLList(ProjectType),
       resolve(parent, args) {
        return Project.find();
       },
    },
    project: { //obtaining a specific client id
      type: ProjectType,
      args: {id: {type: GraphQLID} },
      resolve(parent, args) { 
        return Project.findById(args.id);
      },
    },
    clients: { //Getting the entire clients data 
       type: new GraphQLList(ClientType),
       resolve(parent, args) {
        return Client.find();
       },
    },
    client: { //obtaining a specific client id
      type: ClientType,
      args: {id: {type: GraphQLID} },
      resolve(parent, args){
        return Client.findById(args.id);
      },
    },
  },
});

//mutations:
const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    //Add Client
    addClient: {
      type: ClientType,
      args:{
        name: {type: GraphQLNonNull(GraphQLString)},
        email: {type: GraphQLNonNull(GraphQLString)},
        phone: {type: GraphQLNonNull(GraphQLString)},
    },
    resolve(parent, args){
      const client = new Client({
        name: args.name,
        email: args.email,
        phone: args.phone,
      });
      return client.save();
    },
  },
     //Delete a Client
   deleteClient: {
    type: ClientType,
    args: {
      id: {type: GraphQLNonNull(GraphQLID)},
    },
    resolve(parent, args) {
      Project .find({ clientId: args.id }).then(
        (projects) => {
          projects.forEach(project => {
            project.remove();
          });
        });
      return Client.findByIdAndRemove(args.id);
    },
   },
   //Add a Project:
   addProject: {
    type: ProjectType,
    args: {
      name: {type: GraphQLNonNull(GraphQLString)},
      description: {type: GraphQLNonNull(GraphQLString)},
      status: {
        type: new GraphQLEnumType({
          name: 'ProjectStatus',
          values: {
            'new': {value: 'Not Started'},
            'progress': {value: 'In Progress'},
            'completed': {value: 'Completed'},
          },
        }),
        defaultValue: 'Not Started',
       },
      clientId: { type: GraphQLNonNull(GraphQLID)},
    },
    resolve(parent, args) {
      const project = new Project({
        name: args.name,
        description: args.description,
        status: args.status,
        clientId: args.clientId,
      });

      return project.save();
    },
   },
   //delete a project
   deleteProject:{
    type: ProjectType,
    args: {
      id: { type: GraphQLNonNull(GraphQLID)},
    },
    resolve(parent, args){
      return Project.findByIdAndRemove(args.id);
    },
   },
   //Update a Project
   updateProject: {
    type: ProjectType,
    args: {
      id: { type: GraphQLNonNull(GraphQLID)},
      name: {type: GraphQLString},
      description: {type: GraphQLString},
       status: {
        type: new GraphQLEnumType({
          name: 'ProjectStatusUpdate',
          values: {
            'new': {value: 'Not Started'},
            'progress': {value: 'In Progress'},
            'completed': {value: 'Completed'},
          },
        }),
      },
    },
    resolve(parent, args){
      return Project.findByIdAndUpdate(
        args.id,
        {
          $set: {
            name: args.name,
            description: args.description,
            status: args.status,
          },
        },
        {new: true}
      );
    }
  }
 },

});


module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation
});



 