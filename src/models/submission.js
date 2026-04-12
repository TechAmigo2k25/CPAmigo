import mongoose from 'mongoose';
const startupcode= new mongoose.Schema(
  {
    value:{
      type:String,
      required:true
    },
    label:{
      type:String,
    },
    defaultCode:{
      type:String,
      required:true
    },
  }
)

const submissionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,    
    },
    problem_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
      
     
    },
    code: {
      type: String,
      required: true,
      
    },
    language: {
      type: String,
      required: true,
    },

    result:{
        type:Object,
        default:{}
    },
    startupcode:{
      type:[startupcode],
    },
  
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model('submission', submissionSchema);
