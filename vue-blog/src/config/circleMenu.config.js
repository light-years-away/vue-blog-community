/*
 * @Author: 
 * @Date: 2026-03-19 23:18:23
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-03-22 18:58:22
 * @Description: 
 * @FilePath: \vue-blog\src\config\circleMenu.config.js
 */
export default {
  home:()=>[ {
    icon: "EditPen",
    route: "/editor"
  }],
  index: () => [
    {
      icon: "EditPen",
      route: "/editor"
    }
  ],
  article: () => [
    
    {
      icon: "Star",
    },
    {
      icon: "ChatLineRound",
      handler: "handlerFocusTextarea"
    },
    {
      icon: "EditPen",
      route: "/editor"
    },
    {
      icon: "House",
      route: "/index"
    },
  ],
  editor: () => [
    {
      icon: "House",
      route: "/index"
    },
  ]
}