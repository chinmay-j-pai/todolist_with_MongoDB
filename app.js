//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { it } = require("node:test");
const e = require("express");
const { name } = require("ejs");

const _ = require("lodash")




const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

main().catch(err=>console.log(err));
async function main(){
  mongoose.connect("mongodb+srv://Cluster84201:eGN5SU9yUlF5@cluster84201.ho0wqte.mongodb.net/todolistDB")

  const itemsSchema = {
    name:String
  }
  const Item  =  mongoose.model("Item", itemsSchema)

  const listSchema = {
    name: String,
    items: [itemsSchema]
  }
const List = mongoose.model("List", listSchema)

const item1 = new Item({name:"Welcome to your todolist!"})
const item2 = new Item({name:"Hit the + button to add a new item."})
const item3 = new Item({name:"<-- Hit this to delete an item."})

const defaultItems = [item1,item2,item3]
  app.get("/", async (req, res) => {  
    
      try{
      const foundItems = await Item.find({})

      if(foundItems.length === 0){

        
      
        try{
          const insert = await Item.insertMany(defaultItems)
            
          console.log("Successfully saved default items to DB.")
        
        }catch(err){
          console.log(err)
        }
        res.redirect("/")
      }
      else{ res.render("list", {listTitle: "Today", newListItems: foundItems});}
       
      
    }catch(err){
      console.log(err)
    }


  });

  app.get("/:customListName", async (req,res) => {
    const customListName = _.capitalize(req.params.customListName)

    try{
      const foundList = await List.findOne({name : customListName}).exec()
      // console.log(foundList)
      if(foundList){
        console.log("List exists")
        // console.log(foundList)
        res.render("list", {listTitle: foundList.name, newListItems: await foundList.items});
      } else{
        const list = new List ({
          name: customListName,
          items: defaultItems
        })
        list.save()
        console.log("Created new list")
        // console.log(foundList)
        res.redirect("/"+customListName)
        // res.redirect("/")
      }

    } catch(err){
      // console.log(await List.findOne({name : customListName}))
      console.log(err)
      

      res.redirect("/"+customListName)
    }

    
  })


  // async function insertItem(item){}
  //     try{
  //     const insert = await Item.insertOne(item)
         
  //     console.log("Successfully saved default items to DB.")
 
  //   }catch(err){
  //     console.log(err)
  //   }



  app.post("/", async (req, res) => {

    const itemName = req.body.newItem;
    const listName = req.body.list
    const item = new Item({name:itemName})

    if(listName === "Today"){
      item.save();
      res.redirect("/")
    }else{
      try{
      const foundList = await List.findOne({name:listName})
      foundList.items.push(item)
      foundList.save()
      res.redirect("/"+listName)
    } catch(err){
      console.log(err)
    }
  }
  });

  app.post("/delete", async (req,res) => {

    const checkedItemId = req.body.checkbox
    const listName = req.body.listName
      try{
        if(listName === "Today"){
        await Item.findByIdAndRemove(checkedItemId)
        console.log("Successfully deleted")
        res.redirect("/")
        } else{
          // Model.findOneAndUpdate({name:listName}, { $pull: { items:{_id:checkedItemId} }} )
          try{
          const deleteItem = await List.findOne({name:listName})
          deleteItem.items.pull({ _id: checkedItemId }); 
          deleteItem.save()
          console.log("Successfully deleted")
          } catch(err){
            console.log(err)
          }
            
        res.redirect("/"+listName)

        }
      } catch(err){
        console.log(err)

      }
  })

 
  const externalPort = process.env.PORT
  const port = 3000 


  app.listen(port || externalPort , () => {
    console.log("Server started on port " + externalPort);
  });
}