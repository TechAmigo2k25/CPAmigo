import mongoose from 'mongoose';

const { Schema } = mongoose;

/*
  Sub-schema for test cases
*/
const testCaseSchema = new Schema(
  {
    input: {
      type: String,
      required: true,
      trim: true
    },
    expectedOutput: {
      type: String,
      required: true,
      trim: true
    },
    isHidden: {
      type: Boolean,
      default: false // true for judge-only test cases
    }
  },
  { _id: false }
);

const startupcode= new Schema(
  {
    language:{
      type:String,
      required:true
    },
    code:{
      type:String,
      required:true
    }
  }
)

/*
  Main Problem Schema
*/
const problemSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true
    },

    difficulty: {
      type: String,
      required: true,
      enum: ['Easy', 'Medium', 'Hard'],
      index: true
    },

    description: {
      type: String,
      required: true
    },

    inputFormat: {
      type: String,
      required: true
    },

    outputFormat: {
      type: String,
      required: true
    },

    constraints: {
      type: String,
      required: true
    },

    sampleInput: {
      type: String,
      required: true
    },

    sampleOutput: {
      type: String,
      required: true
    },

    sampleInput2: {
      type: String,
      required: true
    },

    sampleOutput2: {
      type: String,
      required: true
    },
     pdfUrl: {
      type: String,
      
    },

    sampleInputDesc1: {
      type: String,
      required: true
    },

    sampleInputDesc2: {
      type: String,
      required: true
    },

    testCases: {
      type: [testCaseSchema],
      validate: {
        validator: function (value) {
          return value.length > 0;
        },
        message: 'At least one test case is required'
      }
    },

    startupcode:{
      type:[startupcode],
    },

    solved_count: {
      type: Number,
      default: 0,
      min: 0
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);



const Problem = mongoose.model('Problem', problemSchema);

export default Problem;