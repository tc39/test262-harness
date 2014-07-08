function runTestCase(test) {
    if(!test())
        $ERROR("Test returned falsy value")
}
