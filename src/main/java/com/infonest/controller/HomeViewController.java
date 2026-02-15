package com.infonest.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeViewController {
    @GetMapping("/")
    public String index() {
        return "forward:/index.html"; // Ye static/index.html ko call karega
    }
}