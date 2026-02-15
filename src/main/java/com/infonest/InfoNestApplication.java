package com.infonest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class InfoNestApplication {
    public static void main(String[] args) {
        SpringApplication.run(InfoNestApplication.class, args);
    }
}